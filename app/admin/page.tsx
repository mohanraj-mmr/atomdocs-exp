'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, FileText, Folder, BarChart3, Download, Upload, Settings, FileEdit } from 'lucide-react';
import Link from 'next/link';
import { Page, Category } from '@/types';
import { fetchData } from '@/lib/api';
import { deletePage, deleteCategory, saveStorageData } from '@/lib/client-storage';
import { exportData, exportPages, exportCategories, importData } from '@/lib/import-export';
import { useRef } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function AdminPage() {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pagesFileInputRef = useRef<HTMLInputElement>(null);
  const categoriesFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'page' | 'category';
    id: string;
    title: string;
  }>({
    open: false,
    type: 'page',
    id: '',
    title: '',
  });
  const [importDialog, setImportDialog] = useState<{
    open: boolean;
    type: 'all' | 'pages' | 'categories';
    data: any;
  }>({
    open: false,
    type: 'all',
    data: null,
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
        setPages(data.pages);
        // Sort categories by order
        const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [router]);

  const handleDeletePage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setDeleteDialog({
        open: true,
        type: 'page',
        id,
        title: page.title,
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setDeleteDialog({
        open: true,
        type: 'category',
        id,
        title: category.name,
      });
    }
  };

  const confirmDelete = () => {
    if (deleteDialog.type === 'page') {
      deletePage(deleteDialog.id)
        .then(() => {
          setPages(pages.filter(p => p.id !== deleteDialog.id));
          toast.success('Page deleted successfully');
        })
        .catch(error => {
          console.error('Error deleting page:', error);
          toast.error('Failed to delete page');
        });
    } else {
      deleteCategory(deleteDialog.id)
        .then(() => {
          setCategories(categories.filter(c => c.id !== deleteDialog.id));
          toast.success('Category deleted successfully');
        })
        .catch(error => {
          console.error('Error deleting category:', error);
          toast.error('Failed to delete category');
        });
    }
  };

  const handleExportAll = () => {
    fetchData()
      .then(data => {
        exportData(data);
        toast.success('All data exported successfully');
      })
      .catch(error => {
        console.error('Error exporting data:', error);
        toast.error('Failed to export data');
      });
  };

  const handleExportPages = () => {
    exportPages(pages);
    toast.success('Pages exported successfully');
  };

  const handleExportCategories = () => {
    exportCategories(categories);
    toast.success('Categories exported successfully');
  };

  const handleImportAll = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file);
      setImportDialog({
        open: true,
        type: 'all',
        data,
      });
    } catch (error) {
      toast.error('Failed to import data: ' + (error as Error).message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportPages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importData(file);
      if (importedData.pages && importedData.pages.length > 0) {
        setImportDialog({
          open: true,
          type: 'pages',
          data: importedData,
        });
      } else {
        toast.warning('No pages found in the imported file.');
      }
    } catch (error) {
      toast.error('Failed to import pages: ' + (error as Error).message);
    }

    // Reset file input
    if (pagesFileInputRef.current) {
      pagesFileInputRef.current.value = '';
    }
  };

  const handleImportCategories = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importData(file);
      if (importedData.categories && importedData.categories.length > 0) {
        setImportDialog({
          open: true,
          type: 'categories',
          data: importedData,
        });
      } else {
        toast.warning('No categories found in the imported file.');
      }
    } catch (error) {
      toast.error('Failed to import categories: ' + (error as Error).message);
    }

    // Reset file input
    if (categoriesFileInputRef.current) {
      categoriesFileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (importDialog.type === 'all') {
      saveStorageData(importDialog.data)
        .then(() => {
          setPages(importDialog.data.pages);
          setCategories(importDialog.data.categories);
          toast.success('Data imported successfully!');
        })
        .catch(error => {
          console.error('Error importing data:', error);
          toast.error('Failed to import data');
        });
    } else if (importDialog.type === 'pages') {
      fetchData()
        .then(data => {
          const newPages = importDialog.data.pages.map((page: any) => ({
            ...page,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          data.pages = [...data.pages, ...newPages];
          return saveStorageData(data);
        })
        .then(() => {
          return fetchData();
        })
        .then(data => {
          setPages(data.pages);
          toast.success(`Pages imported successfully!`);
        })
        .catch(error => {
          console.error('Error importing pages:', error);
          toast.error('Failed to import pages');
        });
    } else if (importDialog.type === 'categories') {
      fetchData()
        .then(data => {
          const newCategories = importDialog.data.categories.map((category: any) => ({
            ...category,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
          }));
          data.categories = [...data.categories, ...newCategories];
          return saveStorageData(data);
        })
        .then(() => {
          return fetchData();
        })
        .then(data => {
          setCategories(data.categories);
          toast.success(`Categories imported successfully!`);
        })
        .catch(error => {
          console.error('Error importing categories:', error);
          toast.error('Failed to import categories');
        });
    }
  };

  if (!isEditMode) {
    return null;
  }

  const stats = {
    totalPages: pages.length,
    totalCategories: categories.length,
    recentPages: pages.slice(0, 5),
  };

  return (
    <div className="min-h-screen bg-background">
      <Header isEditMode={isEditMode} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your documentation content and settings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPages}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentPages.length}</div>
              <p className="text-xs text-muted-foreground">Recent pages</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pages</CardTitle>
                    <CardDescription>
                      Manage your documentation pages
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href="/admin/pages/">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/admin/pages/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Page
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{page.title}</h3>
                          <Badge variant="secondary">{page.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {page.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {page.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/pages/${page.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {pages.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2" />
                      <p>No pages yet. Create your first page to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                      Organize your content with categories
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href="/admin/categories/">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Link>
                    </Button>
                    <Button asChild>
                      <Link href="/admin/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Category
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {pages.filter(p => p.category === category.slug).length} pages
                        </Badge>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Folder className="h-8 w-8 mx-auto mb-2" />
                      <p>No categories yet. Create your first category to organize content!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Pages</CardTitle>
                  <CardDescription>
                    Your latest documentation pages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentPages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Link href={`/docs/${page.slug}`} className="font-medium hover:text-primary">
                            {page.title}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Updated {new Date(page.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary">{page.category}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild variant="outline">
                      <Link href="/admin/pages/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Page
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admin/categories/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Category
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admin/pages">
                        <FileEdit className="h-4 w-4 mr-2" />
                        Manage Pages
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/admin/categories">
                        <FileEdit className="h-4 w-4 mr-2" />
                        Manage Categories
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleExportAll}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportAll}
          style={{ display: 'none' }}
        />
        <input
          ref={pagesFileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportPages}
          style={{ display: 'none' }}
        />
        <input
          ref={categoriesFileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportCategories}
          style={{ display: 'none' }}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
          title={`Delete ${deleteDialog.type === 'page' ? 'Page' : 'Category'}`}
          description={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="destructive"
          onConfirm={confirmDelete}
        />

        <ConfirmDialog
          open={importDialog.open}
          onOpenChange={(open) => setImportDialog(prev => ({ ...prev, open }))}
          title={`Import ${importDialog.type === 'all' ? 'Data' : importDialog.type === 'pages' ? 'Pages' : 'Categories'}`}
          description={
            importDialog.type === 'all'
              ? 'This will replace all existing data. Are you sure?'
              : `This will add imported ${importDialog.type} to existing ones. Continue?`
          }
          confirmText="Import"
          onConfirm={confirmImport}
        />
      </main>
    </div>
  );
}