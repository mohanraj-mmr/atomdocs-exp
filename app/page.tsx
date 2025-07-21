'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Page } from '@/types';
import { fetchData } from '@/lib/api';
import { useTheme } from '@/components/theme-provider';

export default function Home() {
  const { theme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [recentPages, setRecentPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [appTitle, setAppTitle] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchData();
      setPages(data.pages);
      setRecentPages(data.pages.slice(0, 3));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const appState = process.env.NEXT_PUBLIC_APP_STATE;
    setAppTitle(process.env.NEXT_PUBLIC_APP_TITLE || 'Atom Docs');
    setIsEditMode(appState === 'edit');
    loadData();
  }, [loadData]);


  return (
    <div className="min-h-screen bg-background">
      <Header isEditMode={isEditMode} />

      <div className="flex">
        <Sidebar isEditMode={isEditMode} />
        {isEditMode ? (
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 mt-5">{appTitle}</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  A modern, beautiful documentation platform built with Next.js
                </p>

                <div className="flex justify-center gap-4">
                  {isEditMode && (
                    <Button asChild variant="outline" size="lg">
                      <Link href="/admin/pages/new">Create New Page</Link>
                    </Button>
                  )}
                </div>
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
              )}


              {!loading && isEditMode && recentPages.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Recent Pages</h2>
                  <div className="grid gap-4">
                    {recentPages.map((page) => (
                      <Card key={page.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                <Link href={`/docs/${page.slug}`} className="hover:text-primary">
                                  {page.title}
                                </Link>
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {page.description}
                              </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {page.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>
        ) : (

          <main className="h-[75vh] w-full flex-1 p-6 flex justify-center items-center">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 mt-5">{appTitle}</h1>
                <p className="text-xl text-muted-foreground mb-8">
                  A modern, beautiful documentation platform built with Next.js
                </p>
              </div>
            </div>
          </main>
        )
        }

      </div>
    </div>
  );
}