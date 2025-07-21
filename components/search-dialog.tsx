'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Page } from '@/types';
import { fetchData } from '@/lib/api';
import { searchPages } from '@/lib/search';
import { useRouter } from 'next/navigation';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pages, setPages] = useState<Page[]>([]);
  const [results, setResults] = useState<Page[]>([]);
  const router = useRouter();

  const loadData = useCallback(async () => {
    try {
      const data = await fetchData();
      setPages(data.pages);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchPages(pages, query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, pages]);

  const handleResultClick = (page: Page) => {
    router.push(`/docs/${page.slug}`);
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64">
          <Search className="mr-2 h-4 w-4" />
          Search docs...
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Search Documentation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
            autoFocus
          />
          
          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                  onClick={() => handleResultClick(page)}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h4 className="text-sm font-medium">{page.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {page.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {page.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {query && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}