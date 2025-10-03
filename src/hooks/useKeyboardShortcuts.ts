import { useEffect } from 'react';
import { useEditorStore } from '@/lib/editorStore';

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    selectedFrameId,
    setFrameAsset,
    deletePage,
    currentPageIndex,
    project,
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Undo (Ctrl/Cmd + Z)
      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
        return;
      }

      // Redo (Ctrl/Cmd + Shift + Z)
      if (isCtrlOrCmd && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
        return;
      }

      // Delete selected frame asset (Delete key)
      if (event.key === 'Delete' && selectedFrameId) {
        event.preventDefault();
        setFrameAsset(selectedFrameId, null);
        return;
      }

      // Delete current page (Ctrl/Cmd + Delete)
      if (isCtrlOrCmd && event.key === 'Delete') {
        event.preventDefault();
        if (project?.pagesJson && project.pagesJson.length > 1) {
          deletePage(currentPageIndex);
        }
        return;
      }

      // Auto-layout current page (A key)
      if (event.key === 'a' && !isCtrlOrCmd) {
        event.preventDefault();
        // This would need to be implemented in the store
        // autoLayoutPage(currentPageIndex);
        return;
      }

      // Auto-layout all pages (Ctrl/Cmd + A)
      if (isCtrlOrCmd && event.key === 'a') {
        event.preventDefault();
        // This would need to be implemented in the store
        // autoLayoutAllPages();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    selectedFrameId,
    setFrameAsset,
    deletePage,
    currentPageIndex,
    project,
  ]);
}
