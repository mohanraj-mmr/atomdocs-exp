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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, FileText, ArrowLeft, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DraggablePageItem } from '@/components/draggable-page-item';
import Link from 'next/link';
import { Page, Category } from '@/types';
import { fetchData } from '@/lib/api';
import { deletePage, updatePageOrder } from '@/lib/client-storage';
import { exportPages, importData } from '@/lib/import-export';
import { useRef } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/confirm-dialog';

export default function ManagePagesPage() {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: string;
    title: string;
  }>({
    open: false,
    id: '',
    title: '',
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
        // Sort pages by category and order
        const sortedPages = [...data.pages].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });
        setPages(sortedPages);
        
        // Sort categories by order
        const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);
        setCategories(sortedCategories);
        
        // Expand all categories by default
        setExpandedCategories(new Set(sortedCategories.map(cat => cat.slug)));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [router]);
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activePageId = active.id as string;
      const overPageId = over.id as string;
      
      const activePage = pages.find(p => p.id === activePageId);
      const overPage = pages.find(p => p.id === overPageId);
      
      // Only allow reordering within the same category
      if (activePage && overPage && activePage.category === overPage.category) {
        const categoryPages = pages.filter(p => p.category === activePage.category);
        const otherPages = pages.filter(p => p.category !== activePage.category);
        
        const oldIndex = categoryPages.findIndex(p => p.id === activePageId);
        const newIndex = categoryPages.findIndex(p => p.id === overPageId);
        
        const reorderedCategoryPages = arrayMove(categoryPages, oldIndex, newIndex);
        
        // Update order property for reordered pages
        const updatedCategoryPages = reorderedCategoryPages.map((page, index) => ({
          ...page,
          order: index,
        }));
        
        // Combine with other pages
        const allPages = [...otherPages, ...updatedCategoryPages].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });
        
        setPages(allPages);
        updatePageOrder(allPages).catch(error => {
          console.error('Error updating page order:', error);
          toast.error('Failed to update page order');
        });
        toast.success('Page order updated');
      }
    }
  };

  const handleDeletePage = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setDeleteDialog({
        open: true,
        id,
        title: page.title,
      });
    }
  };

  const confirmDelete = () => {
    deletePage(deleteDialog.id)
      .then(() => {
        setPages(pages.filter(p => p.id !== deleteDialog.id));
        toast.success('Page deleted successfully');
      })
      .catch(error => {
        console.error('Error deleting page:', error);
        toast.error('Failed to delete page');
      });
  };

  const handleExport = () => {
    exportPages(pages);
    toast.success('Pages exported successfully');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importData(file);
      if (importedData.pages && importedData.pages.length > 0) {
        setImportDialog({
          open: true,
          data: importedData,
        });
      } else {
        toast.warning('No pages found in the imported file.');
      }
    } catch (error) {
      toast.error('Failed to import pages: ' + (error as Error).message);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    fetchData()
      .then(data => {
        // Generate new IDs for imported pages to avoid conflicts
        const newPages = importDialog.data.pages.map((page: any) => ({
          ...page,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          order: page.order ?? 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        
        data.pages = [...data.pages, ...newPages];
        return updatePageOrder(data.pages);
      })
      .then(() => {
        return fetchData();
      })
      .then(data => {
        // Sort and update state
        const sortedPages = [...data.pages].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });
        setPages(sortedPages);
        toast.success(`Pages imported successfully!`);
      })
      .catch(error => {
        console.error('Error importing pages:', error);
        toast.error('Failed to import pages');
      });
  };

  const toggleCategory = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  if (!isEditMode) {
    return null;
  }

  // Group pages by category
  const groupedPages = categories.reduce((acc, category) => {
    const categoryPages = pages.filter(page => page.category === category.slug);
    if (categoryPages.length > 0) {
      acc[category.slug] = {
        category,
        pages: categoryPages,
      };
    }
    return acc;
  }, {} as Record<string, { category: Category; pages: Page[] }>);

  // Handle uncategorized pages
  const uncategorizedPages = pages.filter(page => 
    !categories.some(cat => cat.slug === page.category)
  );

  if (uncategorizedPages.length > 0) {
    groupedPages['uncategorized'] = {
      category: {
        id: 'uncategorized',
        name: 'Uncategorized',
        slug: 'uncategorized',
        description: 'Pages without a category',
        order: 999,
        createdAt: new Date().toISOString(),
      },
      pages: uncategorizedPages,
    };
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isEditMode={isEditMode} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Manage Pages</h1>
              <p className="text-muted-foreground">
                Organize your pages within categories
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>All Pages</CardTitle>
                  <CardDescription>
                    Drag and drop pages to reorder them within their categories
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
                    <Link href="/admin/pages/new">
                      <Plus className="h-4 w-4 mr-2" />
                      New Page
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPages).map(([categorySlug, { category, pages: categoryPages }]) => {
                  const IconComponent = category.icon && (LucideIcons as any)[category.icon] 
                    ? (LucideIcons as any)[category.icon] 
                    : LucideIcons.Folder;
                  
                  return (
                    <Collapsible
                      key={categorySlug}
                      open={expandedCategories.has(categorySlug)}
                      onOpenChange={() => toggleCategory(categorySlug)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-start p-4 h-auto border rounded-lg hover:bg-accent"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <IconComponent 
                              className="h-5 w-5 text-muted-foreground" 
                              style={{ color: category.iconColor || 'currentColor' }}
                            />
                            <div className="text-left">
                              <h3 className="font-semibold text-base">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {category.description} • {categoryPages.length} pages
                              </p>
                            </div>
                          </div>
                          {expandedCategories.has(categorySlug) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-4">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                        >
                          <SortableContext items={categoryPages} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3 ml-8">
                              {categoryPages.map((page) => (
                                <DraggablePageItem
                                  key={page.id}
                                  page={page}
                                  onDelete={handleDeletePage}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
                
                {Object.keys(groupedPages).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                    <p>No pages yet. Create your first page to get started!</p>
                  </div>
                )}
              </div>
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
            title="Delete Page"
            description={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="destructive"
            onConfirm={confirmDelete}
          />
          
          <ConfirmDialog
            open={importDialog.open}
            onOpenChange={(open) => setImportDialog(prev => ({ ...prev, open }))}
            title="Import Pages"
            description="This will add imported pages to existing ones. Continue?"
            confirmText="Import"
            onConfirm={confirmImport}
          />
        </div>
      </main>
    </div>
  );
}