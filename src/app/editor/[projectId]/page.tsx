'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEditorStore } from '@/lib/editorStore';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { PageThumbnails } from '@/components/editor/PageThumbnails';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { AssetTray } from '@/components/editor/AssetTray';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const {
    project,
    isLoading,
    error,
    setProject,
    setLoading,
    setError,
    reset,
  } = useEditorStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize autosave
  useAutosave(projectId);

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize unsaved changes warning
  useUnsavedChangesWarning();

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        
        const projectData = await response.json();
        setProject(projectData);
        setIsInitialized(true);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();

    // Cleanup on unmount
    return () => {
      reset();
    };
  }, [projectId, setProject, setLoading, setError, reset]);

  const handleFinishAndReview = () => {
    if (project) {
      router.push(`/review/${project.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Error Loading Project</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!project || !isInitialized) {
    return null;
  }

  if (project.status !== 'editing') {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Project Locked</h2>
          <p className="text-muted-foreground mb-4">
            This project can no longer be edited. Status: {project.status}
          </p>
          <Button onClick={() => router.push(`/review/${project.id}`)}>
            View Project
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <EditorToolbar onFinishAndReview={handleFinishAndReview} />
      
      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Page Thumbnails */}
        <div className="w-64 border-r bg-muted/30 flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Pages</h3>
            <p className="text-sm text-muted-foreground">
              {project.pageCount} pages
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PageThumbnails />
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <EditorCanvas />
          </div>
          
          {/* Asset Tray */}
          <div className="h-32 border-t bg-muted/30">
            <AssetTray />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-muted/30">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
