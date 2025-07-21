'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Calendar, Tag } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Page } from '@/types';
import { fetchData } from '@/lib/api';

interface PageProps {
  params: { slug: string };
}

export default function DocPage({ params }: PageProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const data = await fetchData();
      const foundPage = data.pages.find(p => p.slug === params.slug);

      if (!foundPage) {
        notFound();
      }

      setPage(foundPage);
    } catch (error) {
      console.error('Error loading data:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    const appState = process.env.NEXT_PUBLIC_APP_STATE;
    setIsEditMode(appState === 'edit');
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header isEditMode={isEditMode} />
        <div className="flex">
          <Sidebar isEditMode={isEditMode} />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded-lg w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isEditMode={isEditMode} />

      <div className="flex">
        <Sidebar isEditMode={isEditMode} />

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {page.icon && (() => {
                      const IconComponent = (LucideIcons as any)[page.icon];
                      return IconComponent ? (
                        <IconComponent 
                          className="h-8 w-8 text-primary" 
                          style={{ color: page.iconColor || 'currentColor' }}
                        />
                      ) : null;
                    })()}
                    <h1 className="text-3xl font-bold">{page.title}</h1>
                  </div>
                  <p className="text-lg text-muted-foreground mb-4">
                    {page.description}
                  </p>
                </div>

                {isEditMode && (
                  <Button asChild variant="outline">
                    <Link href={`/admin/pages/${page.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>Category: {page.category}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {page.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs defaultValue="content" className="w-full">
              {isEditMode && (
                <TabsList className={`grid w-full ${isEditMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="info">Page Info</TabsTrigger>
                </TabsList>
              )}

              <TabsContent value="content" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {isEditMode && (
                <TabsContent value="info" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Information</CardTitle>
                      <CardDescription>
                        Metadata and details about this page
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Title
                          </label>
                          <p className="mt-1">{page.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Slug
                          </label>
                          <p className="mt-1 font-mono text-sm">{page.slug}</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Description
                        </label>
                        <p className="mt-1">{page.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Category
                          </label>
                          <p className="mt-1">{page.category}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Tags
                          </label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {page.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Created
                          </label>
                          <p className="mt-1 text-sm">
                            {new Date(page.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Updated
                          </label>
                          <p className="mt-1 text-sm">
                            {new Date(page.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}