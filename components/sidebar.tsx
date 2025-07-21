'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Folder, FileText, Settings, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Category, Page } from '@/types';
import { fetchData } from '@/lib/api';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isEditMode: boolean;
}

export function Sidebar({ isEditMode }: SidebarProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [appTitle, setAppTitle] = useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await fetchData();
      // Sort categories by order
      const sortedCategories = [...data.categories].sort((a, b) => a.order - b.order);
      setCategories(sortedCategories);
      setPages(data.pages);

      // Expand all categories by default
      setExpandedCategories(new Set(sortedCategories.map(cat => cat.slug)));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    setAppTitle(process.env.NEXT_PUBLIC_APP_TITLE || 'Atom Docs');
    loadData();
  }, [loadData]);

  const groupedPages = categories.reduce((acc, category) => {
    acc[category.slug] = pages
      .filter(page => page.category === category.slug)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    return acc;
  }, {} as Record<string, Page[]>);

  const uncategorizedPages = pages.filter(page =>
    !categories.some(cat => cat.slug === page.category)
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  const toggleCategory = (categorySlug: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categorySlug)) {
      newExpanded.delete(categorySlug);
    } else {
      newExpanded.add(categorySlug);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className={cn(
      "glass-sidebar transition-all duration-300 shadow-md dark:shadow-none h-full",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">{appTitle}</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 glass-button"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Separator className="mb-4" />
        <ScrollArea className="h-[calc(100vh-165px)]">
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 mb-2 cursor-pointer glass-hover rounded-lg p-1",
                    isCollapsed && "justify-center"
                  )}
                  onClick={() => !isCollapsed && toggleCategory(category.slug)}
                >
                  {(() => {
                    const IconComponent = category.icon && (LucideIcons as any)[category.icon]
                      ? (LucideIcons as any)[category.icon]
                      : Folder;
                    return (
                      <IconComponent
                        className="h-4 w-4 text-muted-foreground flex-shrink-0"
                        style={{ color: category.iconColor || 'currentColor' }}
                      />
                    );
                  })()}
                  {!isCollapsed && (
                    <>
                      <h3 className="font-medium text-sm flex-1">{category.name}</h3>
                      <Badge variant="secondary" className="text-xs glass">
                        {groupedPages[category.slug]?.length || 0}
                      </Badge>
                      {expandedCategories.has(category.slug) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                    </>
                  )}
                </div>

                {(!isCollapsed && expandedCategories.has(category.slug)) && (
                  <div className="ml-6 space-y-1">
                    {groupedPages[category.slug]?.map((page) => {
                      const IconComponent = page.icon && (LucideIcons as any)[page.icon]
                        ? (LucideIcons as any)[page.icon]
                        : FileText;

                      return (
                        <Link
                          key={page.id}
                          href={`/docs/${page.slug}`}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-sm glass-hover transition-colors",
                            pathname === `/docs/${page.slug}` ? "glass shadow-lg dark:shadow-none" : ""
                          )}
                        >
                          <IconComponent
                            className="h-3 w-3 text-muted-foreground flex-shrink-0"
                            style={{ color: page.iconColor || 'currentColor' }}
                          />
                          <span className="truncate">{page.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {isCollapsed && (
                  <div className="space-y-1">
                    {groupedPages[category.slug]?.map((page) => {
                      const IconComponent = page.icon && (LucideIcons as any)[page.icon]
                        ? (LucideIcons as any)[page.icon]
                        : FileText;

                      return (
                        <Link
                          key={page.id}
                          href={`/docs/${page.slug}`}
                          className={cn(
                            "flex items-center justify-center p-2 rounded-lg text-sm glass-hover transition-colors",
                            pathname === `/docs/${page.slug}` ? "glass shadow-lg dark:shadow-none" : ""
                          )}
                          title={page.title}
                        >
                          <IconComponent
                            className="h-4 w-4 text-muted-foreground"
                            style={{ color: page.iconColor || 'currentColor' }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {uncategorizedPages.length > 0 && (
              <div>
                <div
                  className={cn(
                    "flex items-center gap-2 mb-2 cursor-pointer glass-hover rounded-lg p-1",
                    isCollapsed && "justify-center"
                  )}
                  onClick={() => !isCollapsed && toggleCategory('uncategorized')}
                >
                  <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <h3 className="font-medium text-sm flex-1">Uncategorized</h3>
                      <Badge variant="secondary" className="text-xs glass">
                        {uncategorizedPages.length}
                      </Badge>
                      {expandedCategories.has('uncategorized') ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronUp className="h-3 w-3" />
                      )}
                    </>
                  )}
                </div>

                {(!isCollapsed && expandedCategories.has('uncategorized')) && (
                  <div className="ml-6 space-y-1">
                    {uncategorizedPages.map((page) => {
                      const IconComponent = page.icon && (LucideIcons as any)[page.icon]
                        ? (LucideIcons as any)[page.icon]
                        : FileText;

                      return (
                        <Link
                          key={page.id}
                          href={`/docs/${page.slug}`}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-sm glass-hover transition-colors",
                            pathname === `/docs/${page.slug}` ? "glass shadow-lg dark:shadow-none" : ""
                          )}
                        >
                          <IconComponent
                            className="h-3 w-3 text-muted-foreground flex-shrink-0"
                            style={{ color: page.iconColor || 'currentColor' }}
                          />
                          <span className="truncate">{page.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {isCollapsed && (
                  <div className="space-y-1">
                    {uncategorizedPages.map((page) => {
                      const IconComponent = page.icon && (LucideIcons as any)[page.icon]
                        ? (LucideIcons as any)[page.icon]
                        : FileText;

                      return (
                        <Link
                          key={page.id}
                          href={`/docs/${page.slug}`}
                          className={cn(
                            "flex items-center justify-center p-2 rounded-lg text-sm glass-hover transition-colors",
                            pathname === `/docs/${page.slug}` ? "glass shadow-lg dark:shadow-none" : ""
                          )}
                          title={page.title}
                        >
                          <IconComponent
                            className="h-4 w-4 text-muted-foreground"
                            style={{ color: page.iconColor || 'currentColor' }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}