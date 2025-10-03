'use client';

import { Button } from '@/components/ui/button';
import { useEditorStore } from '@/lib/editorStore';
import { Undo2, Redo2, Save, Eye } from 'lucide-react';

interface EditorToolbarProps {
  onFinishAndReview: () => void;
}

export function EditorToolbar({ onFinishAndReview }: EditorToolbarProps) {
  const {
    isSaving,
    lastSaved,
    canUndo,
    canRedo,
    undo,
    redo,
    showPrintSafe,
    togglePrintSafe,
  } = useEditorStore();

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <h1 className="font-semibold">Photo Editor</h1>
        
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Print Safe Toggle */}
        <Button
          variant={showPrintSafe ? "default" : "ghost"}
          size="sm"
          onClick={togglePrintSafe}
          title="Toggle print-safe overlay"
        >
          <Eye className="h-4 w-4 mr-2" />
          Print Safe
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        {/* Save Status */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-3 w-3" />
              <span>Saved {formatLastSaved(lastSaved)}</span>
            </>
          )}
        </div>

        {/* Finish & Review Button */}
        <Button onClick={onFinishAndReview} className="bg-primary">
          Finish & Review
        </Button>
      </div>
    </div>
  );
}
