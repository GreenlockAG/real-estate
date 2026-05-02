import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Maximize2, Minimize2, RotateCcw, Square, RectangleHorizontal } from 'lucide-react';
import { CardSize, CardType } from '@/types/layout';
import { useLayout } from '@/contexts/LayoutContext';

interface CardLayoutControlsProps {
  cardId: CardType;
  currentSize: CardSize;
  className?: string;
}

export default function CardLayoutControls({ cardId, currentSize, className }: CardLayoutControlsProps) {
  const { updateCardSize, resetLayout, isEditing, setIsEditing } = useLayout();

  const handleSizeChange = (size: CardSize) => {
    updateCardSize(cardId, size);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isEditing && (
        <>
          {/* Size Toggle Buttons */}
          <div className="flex rounded-md border border-border bg-background">
            <Button
              variant={currentSize === 'quarter' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSizeChange('quarter')}
              className="rounded-r-none px-2 py-1"
              data-testid={`button-size-quarter-${cardId}`}
              title="1/4 Width"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant={currentSize === 'third' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSizeChange('third')}
              className="rounded-none border-l px-2 py-1"
              data-testid={`button-size-third-${cardId}`}
              title="1/3 Width"
            >
              <Square className="h-3 w-3" />
            </Button>
            <Button
              variant={currentSize === 'half' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSizeChange('half')}
              className="rounded-none border-l px-2 py-1"
              data-testid={`button-size-half-${cardId}`}
              title="1/2 Width"
            >
              <RectangleHorizontal className="h-3 w-3" />
            </Button>
            <Button
              variant={currentSize === 'full' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleSizeChange('full')}
              className="rounded-l-none border-l px-2 py-1"
              data-testid={`button-size-full-${cardId}`}
              title="Full Screen"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </>
      )}

      {/* Settings Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            data-testid={`button-card-settings-${cardId}`}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-toggle-edit-mode"
          >
            {isEditing ? 'Exit Edit Mode' : 'Edit Layout'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSizeChange('quarter')}
            data-testid={`button-menu-quarter-${cardId}`}
          >
            1/4 Width
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSizeChange('third')}
            data-testid={`button-menu-third-${cardId}`}
          >
            1/3 Width
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSizeChange('half')}
            data-testid={`button-menu-half-${cardId}`}
          >
            1/2 Width
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleSizeChange('full')}
            data-testid={`button-menu-full-${cardId}`}
          >
            Full Screen
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={resetLayout}
            className="text-destructive focus:text-destructive"
            data-testid="button-reset-layout"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Layout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}