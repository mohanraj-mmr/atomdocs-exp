'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchDialog } from './search-dialog';
import { ThemeToggle } from './theme-toggle';
import { useTheme } from './theme-provider';

interface HeaderProps {
  isEditMode: boolean;
}

export function Header({ isEditMode }: HeaderProps) {
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full glass-header shadow-md dark:shadow-none ">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={theme === 'light' ? "/images/logo-dark.png" : "/images/light.png"}
              alt="Atom Code Docs Logo"
              width={24}
              height={24}
              className="h-6 w-6"
              key={theme}
            />
            <span className="font-bold">Atom Code Docs</span>
          </Link>

          {isEditMode && (
            <Badge variant="outline" className="text-xs glass">
              Edit Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          <SearchDialog />

          {isEditMode && (
            <Button asChild variant="outline" size="sm" className="glass-button">
              <Link href="/admin">
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}