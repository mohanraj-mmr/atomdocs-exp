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

export function saveStorageData(data: AppState): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'));
      return;
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      reject(error);
    }
  });
}

export function savePage(page: Page): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = getStorageData();
      const existingIndex = data.pages.findIndex(p => p.id === page.id);
      
      if (existingIndex >= 0) {
        data.pages[existingIndex] = page;
      } else {
        data.pages.push(page);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function deletePage(pageId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = getStorageData();
      data.pages = data.pages.filter(p => p.id !== pageId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function saveCategory(category: Category): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = getStorageData();
      const existingIndex = data.categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        data.categories[existingIndex] = category;
      } else {
        data.categories.push(category);
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function deleteCategory(categoryId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = getStorageData();
      data.categories = data.categories.filter(c => c.id !== categoryId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function updateCategoryOrder(categories: Category[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = getStorageData();
      data.categories = categories;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function updatePageOrder(pages: Page[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const data = getStorageData();
      data.pages = pages;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function updatePageOrderSync(pages: Page[]): void {
  const data = getStorageData();
  data.pages = pages;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}