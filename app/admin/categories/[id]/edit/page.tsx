'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconPicker } from '@/components/icon-picker';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types';
import { fetchData } from '@/lib/api';
import { saveCategory } from '@/lib/client-storage';
import { toast } from 'sonner';

interface EditCategoryProps {
  params: { id: string };
}

export default function EditCategoryPage({ params }: EditCategoryProps) {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    iconColor: '',
  });

  useEffect(() => {
    const appState = process.env.NEXT_PUBLIC_APP_STATE;
    if (appState !== 'edit') {
      router.push('/');
      return;
    }
    setIsEditMode(true);
    
    const loadData = async () => {
      try {
        const data = await fetchData();
        const category = data.categories.find(c => c.id === params.id);
        
        if (!category) {
          router.push('/admin/categories');
          return;
        }
        
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description,
          icon: category.icon || '',
          iconColor: category.iconColor || '',
        });
        
        setCategoryLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        router.push('/admin/categories');
      }
    };

    loadData();
  }, [router, params.id]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await fetchData();
      const originalCategory = data.categories.find(c => c.id === params.id);
      
      if (!originalCategory) {
        toast.error('Category not found');
        return;
      }
      
      const updatedCategory: Category = {
        ...originalCategory,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        iconColor: formData.iconColor,
      };
      
      await saveCategory(updatedCategory);
      router.push('/admin/categories');
      toast.success('Category updated successfully');
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isEditMode || categoryLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isEditMode={isEditMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/categories">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Category</h1>
              <p className="text-muted-foreground">
                Update your category information
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>
                  Basic information about your category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="category-slug"
                    required
                  />
                </div>
                
                <IconPicker
                  selectedIcon={formData.icon}
                  selectedColor={formData.iconColor}
                  onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
                  onColorSelect={(color) => setFormData(prev => ({ ...prev, iconColor: color }))}
                />
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the category"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button asChild variant="outline">
                <Link href="/admin/categories">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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