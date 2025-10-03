import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/lib/editorStore';
import debounce from 'lodash.debounce';

export function useAutosave(projectId: string, delay: number = 800) {
  const {
    project,
    setSaving,
    setLastSaved,
    saveToHistory,
  } = useEditorStore();

  const isInitialLoad = useRef(true);
  const lastSavedData = useRef<string>('');

  const saveProject = async (projectData: any) => {
    if (!projectData || !projectId) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pagesJson: projectData.pagesJson,
          pageCount: projectData.pageCount,
          priceCents: projectData.priceCents,
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      } else {
        console.error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useRef(
    debounce((projectData: any) => {
      saveProject(projectData);
    }, delay)
  ).current;

  useEffect(() => {
    // Skip autosave on initial load
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!project) return;

    // Create a serialized version to compare
    const currentData = JSON.stringify({
      pagesJson: project.pagesJson,
      pageCount: project.pageCount,
      priceCents: project.priceCents,
    });

    // Only save if data has actually changed
    if (currentData !== lastSavedData.current) {
      lastSavedData.current = currentData;
      debouncedSave(project);
    }
  }, [project?.pagesJson, project?.pageCount, project?.priceCents, debouncedSave]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    saveProject: () => project && saveProject(project),
  };
}
