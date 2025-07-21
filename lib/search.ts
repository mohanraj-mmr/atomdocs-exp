import Fuse from 'fuse.js';
import { Page } from '@/types';

const searchOptions = {
  keys: [
    { name: 'title', weight: 0.4 },
    { name: 'description', weight: 0.3 },
    { name: 'content', weight: 0.2 },
    { name: 'tags', weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
};

export const searchPages = (pages: Page[], query: string): Page[] => {
  if (!query.trim()) return pages;
  
  const fuse = new Fuse(pages, searchOptions);
  const results = fuse.search(query);
  
  return results.map(result => result.item);
};