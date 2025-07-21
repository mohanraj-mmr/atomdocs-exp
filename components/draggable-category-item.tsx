'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Category } from '@/types';

interface DraggableCategoryItemProps {
  category: Category;
  pageCount: number;
  onDelete: (id: string) => void;
}

export function DraggableCategoryItem({ category, pageCount, onDelete }: DraggableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = category.icon && (LucideIcons as any)[category.icon] 
    ? (LucideIcons as any)[category.icon] 
    : LucideIcons.Folder;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 border rounded-lg bg-background ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <IconComponent 
              className="h-4 w-4 text-muted-foreground" 
              style={{ color: category.iconColor || 'currentColor' }}
            />
            <h3 className="font-medium">{category.name}</h3>
            <Badge variant="secondary">
              {pageCount} pages
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Slug: {category.slug}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/categories/${category.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(category.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}