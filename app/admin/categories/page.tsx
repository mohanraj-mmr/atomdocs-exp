'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Folder, ArrowLeft, Download, Upload } from 'lucide-react';
import { DraggableCategoryItem } from '@/components/draggable-category-item';
import Link from 'next/link';
import { Category } from '@/types';
import { fetchData } from '@/lib/api';
import { deleteCategory, updateCategoryOrder, saveStorageData } from '@/lib/client-storage';
import { exportCategories, importData } from '@/lib/import-export';
import { useRef } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function CategoriesPage() {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({
    open: false,
    id: '',
    name: '',
  });
  const [importDialog, setImportDialog] = useState<{
    open: boolean;
    data: any;
  }>({
    open: false,
    data: null,
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        // Sort categories by order
        const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);
        setCategories(sortedCategories);
        setPages(data.pages);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [router]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((category) => category.id === active.id);
      const newIndex = categories.findIndex((category) => category.id === over.id);
      
      const newCategories = arrayMove(categories, oldIndex, newIndex);
      
      // Update order property for all categories
      const updatedCategories = newCategories.map((category, index) => ({
        ...category,
        order: index,
      }));
      
      setCategories(updatedCategories);
      updateCategoryOrder(updatedCategories).catch(error => {
        console.error('Error updating category order:', error);
        toast.error('Failed to update category order');
      });
      toast.success('Category order updated');
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setDeleteDialog({
        open: true,
        id,
        name: category.name,
      });
    }
  };

  const confirmDelete = () => {
    deleteCategory(deleteDialog.id)
      .then(() => {
        setCategories(categories.filter(c => c.id !== deleteDialog.id));
        toast.success('Category deleted successfully');
      })
      .catch(error => {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      });
  };

  const handleExport = () => {
    exportCategories(categories);
    toast.success('Categories exported successfully');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importData(file);
      if (importedData.categories && importedData.categories.length > 0) {
        setImportDialog({
          open: true,
          data: importedData,
        });
      } else {
        toast.warning('No categories found in the imported file.');
      }
    } catch (error) {
      toast.error('Failed to import categories: ' + (error as Error).message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    fetchData()
      .then(data => {
        // Generate new IDs for imported categories to avoid conflicts
        const newCategories = importDialog.data.categories.map((category: any) => ({
          ...category,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          order: category.order ?? 0,
          createdAt: new Date().toISOString(),
        }));
        
        // Update order for new categories to avoid conflicts
        const maxOrder = data.categories.length > 0 ? Math.max(...data.categories.map(c => c.order)) : -1;
        const categoriesWithOrder = newCategories.map((category: any, index: number) => ({
          ...category,
          order: maxOrder + 1 + index,
        }));
        
        data.categories = [...data.categories, ...categoriesWithOrder];
        return saveStorageData(data);
      })
      .then(() => {
        return fetchData();
      })
      .then(data => {
        // Sort and update state
        const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);
        setCategories(sortedCategories);
        toast.success(`Categories imported successfully!`);
      })
      .catch(error => {
        console.error('Error importing categories:', error);
        toast.error('Failed to import categories');
      });
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
              <h1 className="text-3xl font-bold">Categories</h1>
              <p className="text-muted-foreground">
                Manage your content categories
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Categories</CardTitle>
                  <CardDescription>
                    Organize your documentation with categories
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <DraggableCategoryItem
                        key={category.id}
                        category={category}
                        pageCount={pages.filter(p => p.category === category.slug).length}
                        onDelete={handleDeleteCategory}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
                
              {categories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2" />
                  <p>No categories yet. Create your first category to organize content!</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          
          <ConfirmDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            title="Delete Category"
            description={`Are you sure you want to delete "${deleteDialog.name}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
            onConfirm={confirmDelete}
          />
          
          <ConfirmDialog
            open={importDialog.open}
            onOpenChange={(open) => setImportDialog(prev => ({ ...prev, open }))}
            title="Import Categories"
            description="This will add imported categories to existing ones. Continue?"
            confirmText="Import"
            onConfirm={confirmImport}
          />
        </div>
      </main>
    </div>
  );
}