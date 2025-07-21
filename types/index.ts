export interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  icon?: string;
  iconColor?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  iconColor?: string;
  order: number;
  createdAt: string;
}

export interface AppState {
  pages: Page[];
  categories: Category[];
}