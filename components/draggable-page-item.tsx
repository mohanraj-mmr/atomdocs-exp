'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { Page } from '@/types';

interface DraggablePageItemProps {
  page: Page;
  onDelete: (id: string) => void;
}

export function DraggablePageItem({ page, onDelete }: DraggablePageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = page.icon && (LucideIcons as any)[page.icon] 
    ? (LucideIcons as any)[page.icon] 
    : LucideIcons.FileText;

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
              style={{ color: page.iconColor || 'currentColor' }}
            />
            <h3 className="font-medium">{page.title}</h3>
            <div className="flex flex-wrap gap-1">
              {page.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {page.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{page.tags.length - 2}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {page.description}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Slug: {page.slug}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/docs/${page.slug}`}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/pages/${page.id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(page.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}