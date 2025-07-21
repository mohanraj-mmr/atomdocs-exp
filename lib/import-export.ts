import { AppState, Page, Category } from '@/types';

export const exportData = (data: AppState): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `docs-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as AppState;
        
        // Handle different import formats
        let validatedData: AppState;
        
        if (data.pages && data.categories) {
          // Full app state import
          validatedData = data;
        } else if (data.pages && !data.categories) {
          // Pages-only import
          validatedData = { pages: data.pages, categories: [] };
        } else if (data.categories && !data.pages) {
          // Categories-only import
          validatedData = { pages: [], categories: data.categories };
        } else {
          throw new Error('Invalid data format - must contain pages and/or categories');
        }
        
        // Validate pages structure if present
        if (validatedData.pages && Array.isArray(validatedData.pages)) {
          validatedData.pages.forEach((page, index) => {
            if (!page.id || !page.title || !page.slug || !page.content) {
              throw new Error(`Invalid page structure at index ${index}`);
            }
          });
        }
        
        // Validate categories structure if present
        if (validatedData.categories && Array.isArray(validatedData.categories)) {
          validatedData.categories.forEach((category, index) => {
            if (!category.id || !category.name || !category.slug) {
              throw new Error(`Invalid category structure at index ${index}`);
            }
          });
        }
        
        resolve(validatedData);
      } catch (error) {
        reject(new Error('Failed to parse JSON file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const exportPages = (pages: Page[]): void => {
  const dataStr = JSON.stringify({ pages }, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pages-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCategories = (categories: Category[]): void => {
  const dataStr = JSON.stringify({ categories }, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `categories-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};