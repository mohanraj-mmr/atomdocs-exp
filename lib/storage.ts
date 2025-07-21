import { Category, Page, AppState } from '@/types';

const STORAGE_KEY = 'atom-docs-data';

export function getStorageData(): AppState {
  if (typeof window === 'undefined') {
    return { pages: [], categories: [] };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { pages: [], categories: [] };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading localStorage:', error);
    return { pages: [], categories: [] };
  }
}

export function saveStorageData(data: AppState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    throw error;
  }
}

export function savePage(page: Page): void {
  const data = getStorageData();
  const existingIndex = data.pages.findIndex(p => p.id === page.id);
  
  if (existingIndex >= 0) {
    data.pages[existingIndex] = page;
  } else {
    data.pages.push(page);
  }
  
  saveStorageData(data);
}

export function deletePage(pageId: string): void {
  const data = getStorageData();
  data.pages = data.pages.filter(p => p.id !== pageId);
  saveStorageData(data);
}

export function saveCategory(category: Category): void {
  const data = getStorageData();
  const existingIndex = data.categories.findIndex(c => c.id === category.id);
  
  if (existingIndex >= 0) {
    data.categories[existingIndex] = category;
  } else {
    data.categories.push(category);
  }
  
  saveStorageData(data);
}

export function deleteCategory(categoryId: string): void {
  const data = getStorageData();
  data.categories = data.categories.filter(c => c.id !== categoryId);
  saveStorageData(data);
}

export function updateCategoryOrder(categories: Category[]): void {
  const data = getStorageData();
  data.categories = categories;
  saveStorageData(data);
}

export function updatePageOrder(pages: Page[]): void {
  const data = getStorageData();
  data.pages = pages;
  saveStorageData(data);
}