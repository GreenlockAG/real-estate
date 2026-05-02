import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { CardType, CardSize } from '@/types/layout';
import { useLayout } from '@/contexts/LayoutContext';
import CardLayoutControls from './CardLayoutControls';
import { GripVertical } from 'lucide-react';

interface DraggableCardProps {
  id: CardType;
  size: CardSize;
  children: React.ReactNode;
  className?: string;
}

export default function DraggableCard({ id, size, children, className }: DraggableCardProps) {
  const { isEditing } = useLayout();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Calculate grid column span based on size (using 12-column grid)
  const getColumnSpan = () => {
    switch (size) {
      case 'quarter':
        return 'col-span-1 md:col-span-3 lg:col-span-3';  // 1/4 of 12 = 3
      case 'third':
        return 'col-span-1 md:col-span-3 lg:col-span-4';  // 1/3 of 12 = 4
      case 'half':
        return 'col-span-1 md:col-span-6 lg:col-span-6';  // 1/2 of 12 = 6
      case 'full':
        return 'col-span-1 md:col-span-6 lg:col-span-12'; // 12/12 = 12
      default:
        return 'col-span-1';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${getColumnSpan()} ${className} ${isDragging ? 'z-50' : ''} rounded-lg border bg-card text-card-foreground shadow-sm`}
      data-testid={`draggable-card-${id}`}
    >
      <Card className={`h-full relative group border-0 shadow-none bg-transparent ${isDragging ? 'shadow-lg' : ''} ${isEditing ? 'ring-2 ring-primary/20' : ''}`}>
        {/* Settings gear icon - always visible on hover */}
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-2 bg-background/80 backdrop-blur rounded-md p-1">
            <CardLayoutControls
              cardId={id}
              currentSize={size}
              className="flex-shrink-0"
            />
            {/* Drag Handle - only visible when editing */}
            {isEditing && (
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
                data-testid={`drag-handle-${id}`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Card Content */}
        <div className={`h-full ${isEditing ? 'pointer-events-none' : ''}`}>
          {children}
        </div>
      </Card>
    </div>
  );
}