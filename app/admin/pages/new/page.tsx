'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/rich-text-editor';
import { IconPicker } from '@/components/icon-picker';
import { Save, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Page, Category } from '@/types';
import { fetchData } from '@/lib/api';
import { savePage } from '@/lib/client-storage';
import { toast } from 'sonner';

export default function NewPagePage() {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    category: '',
    tags: [] as string[],
    icon: '',
    iconColor: '',
    content: '<p>Start writing your content here...</p>',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const appState = process.env.NEXT_PUBLIC_APP_STATE;
    if (appState !== 'edit') {
      router.push('/');
      return;
    }
    setIsEditMode(true);

    const loadCategories = async () => {
      try {
        const data = await fetchData();
        setCategories(data.categories);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, [router]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const newPage: Page = {
        id: Date.now().toString(),
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        icon: formData.icon,
        iconColor: formData.iconColor,
        content: formData.content,
        order: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await savePage(newPage);
      router.push(`/docs/${newPage.slug}`);
      toast.success('Page created successfully');
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isEditMode={isEditMode} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Create New Page</h1>
              <p className="text-muted-foreground">
                Add a new page to your documentation
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Details</CardTitle>
                <CardDescription>
                  Basic information about your page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter page title"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the page"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <IconPicker
                  selectedIcon={formData.icon}
                  selectedColor={formData.iconColor}
                  onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
                  onColorSelect={(color) => setFormData(prev => ({ ...prev, iconColor: color }))}
                />

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag and press Enter"
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  Write your page content using the rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/admin">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Page
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}