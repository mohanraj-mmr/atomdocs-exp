'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { X, Palette } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface IconPickerProps {
  selectedIcon?: string;
  selectedColor?: string;
  onIconSelect: (iconName: string) => void;
  onColorSelect: (color: string) => void;
}

// 20 most useful icons for documentation
const mostUsefulIcons = [
  'BarChart2',
  'Code', 
  'Code2',
  'DownloadCloud',
  'Eye',
  'FileVideo',
  'FileDown',
  'FlaskConical', 
  'Hexagon',
  'Key',
  'Layers', 
  'LayoutDashboard', 
  'LucideBarChartHorizontalBig', 
  'Maximize',
  'Minimize', 
  'Moon', 
  'Settings', 
  'Sun', 
  'Package', 
  'Pencil',
  'PieChart',
  'Power', 
  'Puzzle',
  'ShieldCheck', 
  'ShipWheel', 
  'Star',
  'Scroll',
  'Trash',
  'UploadCloud',
  'Users', 
];

const iconColors = [
  { name: 'Purple', value: '#8b5cf6', class: 'text-purple-500' },
  { name: 'Red', value: '#ef4444', class: 'text-red-500' },
  { name: 'Green', value: '#22c55e', class: 'text-green-500' },
  { name: 'Blue', value: '#3b82f6', class: 'text-blue-500' },
  { name: 'Yellow', value: '#eab308', class: 'text-yellow-500' },
];

export function IconPicker({ selectedIcon, selectedColor, onIconSelect, onColorSelect }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setOpen(false);
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setColorOpen(false);
  };

  const clearIcon = () => {
    onIconSelect('');
    onColorSelect('');
  };

  const SelectedIcon = selectedIcon && (LucideIcons as any)[selectedIcon]
    ? (LucideIcons as any)[selectedIcon]
    : null;

  const selectedColorObj = iconColors.find(c => c.value === selectedColor);

  return (
    <div className="space-y-2">
      <Label>Icon (Optional)</Label>
      <div className="flex gap-2 items-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex-1 justify-start">
              {SelectedIcon ? (
                <>
                  <SelectedIcon
                    className="h-4 w-4 mr-2"
                    style={{ color: selectedColor || 'currentColor' }}
                  />
                  {selectedIcon}
                </>
              ) : (
                <>
                  <div className="h-4 w-4 mr-2 border border-dashed border-muted-foreground rounded" />
                  Select an icon...
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <h4 className="font-medium text-sm">Choose an icon</h4>
              <p className="text-xs text-muted-foreground">Select from our most useful icons</p>
            </div>
            <div className="grid grid-cols-5 gap-1 p-3">
              {mostUsefulIcons.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName];
                if (!IconComponent) return null;

                return (
                  <Button
                    key={iconName}
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 p-0 hover:bg-accent flex flex-col items-center justify-center gap-1"
                    onClick={() => handleIconSelect(iconName)}
                    title={iconName}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-xs truncate w-full text-center">
                      {iconName.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {selectedIcon && (
          <Popover open={colorOpen} onOpenChange={setColorOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" title="Select color">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Icon Color</h4>
                <div className="grid grid-cols-5 gap-2">
                  {iconColors.map((color) => (
                    <Button
                      key={color.value}
                      variant="ghost"
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-full border-2 ${selectedColor === color.value ? 'border-foreground' : 'border-transparent'
                        } hover:border-muted-foreground`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => handleColorSelect('')}
                >
                  Default Color
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {selectedIcon && (
          <Button variant="outline" size="icon" onClick={clearIcon}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {selectedIcon && SelectedIcon && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <SelectedIcon
              className="h-3 w-3"
              style={{ color: selectedColor || 'currentColor' }}
            />
            {selectedIcon}
            {selectedColorObj && (
              <span className="text-xs ml-1">({selectedColorObj.name})</span>
            )}
          </Badge>
        </div>
      )}
    </div>
  );
}