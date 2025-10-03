'use client';

import { useEditorStore } from '@/lib/editorStore';
import { getTemplate } from '@/lib/albumTemplates';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Copy, Trash2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortablePageThumbnailProps {
  page: any;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function SortablePageThumbnail({
  page,
  index,
  isActive,
  onClick,
  onDuplicate,
  onDelete,
}: SortablePageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const template = getTemplate(page.templateKey);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2"
    >
      <Card
        className={`cursor-pointer transition-colors ${
          isActive ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
        }`}
        onClick={onClick}
      >
        <div className="p-2">
          <div className="aspect-[3/4] bg-muted rounded mb-2 relative overflow-hidden">
            {/* Simple thumbnail representation */}
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              {template?.name || 'Unknown'}
            </div>
            {/* Frame indicators */}
            {template?.frames.map((frame) => (
              <div
                key={frame.id}
                className="absolute border border-primary/30 bg-primary/10"
                style={{
                  left: `${frame.x * 100}%`,
                  top: `${frame.y * 100}%`,
                  width: `${frame.w * 100}%`,
                  height: `${frame.h * 100}%`,
                }}
              />
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Page {index + 1}</span>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function PageThumbnails() {
  const {
    project,
    currentPageIndex,
    setCurrentPage,
    addPage,
    duplicatePage,
    deletePage,
    reorderPages,
  } = useEditorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!project || !project.pagesJson) {
    return null;
  }

  const pages = project.pagesJson;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = pages.findIndex((page) => page.id === active.id);
      const newIndex = pages.findIndex((page) => page.id === over.id);
      
      reorderPages(oldIndex, newIndex);
    }
  };

  const handleAddPage = () => {
    // Use the same template as the current page or default
    const currentPage = pages[currentPageIndex];
    const template = getTemplate(currentPage?.templateKey || 'full-bleed');
    if (template) {
      addPage(template);
    }
  };

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={pages.map(page => page.id)}
          strategy={verticalListSortingStrategy}
        >
          {pages.map((page, index) => (
            <SortablePageThumbnail
              key={page.id}
              page={page}
              index={index}
              isActive={index === currentPageIndex}
              onClick={() => setCurrentPage(index)}
              onDuplicate={() => duplicatePage(index)}
              onDelete={() => deletePage(index)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add Page Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleAddPage}
        className="w-full mt-2"
        disabled={pages.length >= 120}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Page
      </Button>
      
      {pages.length >= 120 && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Maximum 120 pages
        </p>
      )}
    </div>
  );
}
