import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Frame, Template } from './albumTemplates';

export interface Page {
  id: string;
  templateKey: string;
  frames: {
    [frameId: string]: {
      assetId?: string;
      crop?: {
        scale: number;
        offsetX: number;
        offsetY: number;
        rotation: number;
      };
      fit?: 'cover' | 'contain';
      alignment?: 'center' | 'top' | 'bottom' | 'left' | 'right';
      bleed?: boolean;
    };
  };
}

export interface Asset {
  id: string;
  url: string;
  width: number;
  height: number;
  storageKey: string;
}

export interface Project {
  id: string;
  status: 'editing' | 'ready' | 'ordered' | 'paid';
  variantId: string;
  size: string;
  pageCount: number;
  pagesJson?: Page[];
  priceCents: number;
  currency: string;
  assets: Asset[];
}

interface EditorState {
  // Project data
  project: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Editor state
  currentPageIndex: number;
  selectedFrameId: string | null;
  selectedAssetId: string | null;
  
  // UI state
  isSaving: boolean;
  lastSaved: Date | null;
  showPrintSafe: boolean;
  
  // History for undo/redo
  history: Page[][];
  historyIndex: number;
  
  // Actions
  setProject: (project: Project) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Page management
  setCurrentPage: (index: number) => void;
  addPage: (template: Template) => void;
  deletePage: (index: number) => void;
  duplicatePage: (index: number) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  
  // Frame management
  selectFrame: (frameId: string | null) => void;
  setFrameAsset: (frameId: string, assetId: string | null) => void;
  updateFrameCrop: (frameId: string, crop: any) => void;
  updateFrameProperties: (frameId: string, properties: any) => void;
  
  // Asset management
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  selectAsset: (assetId: string | null) => void;
  
  // Template management
  changePageTemplate: (pageIndex: number, template: Template) => void;
  
  // Auto-layout
  autoLayoutPage: (pageIndex: number) => void;
  autoLayoutAllPages: () => void;
  
  // History management
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // UI actions
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  togglePrintSafe: () => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  project: null,
  isLoading: false,
  error: null,
  currentPageIndex: 0,
  selectedFrameId: null,
  selectedAssetId: null,
  isSaving: false,
  lastSaved: null,
  showPrintSafe: false,
  history: [],
  historyIndex: -1,
};

export const useEditorStore = create<EditorState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      setProject: (project) => {
        set({ project, error: null });
        // Initialize history with current pages
        if (project.pagesJson) {
          get().saveToHistory();
        }
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      
      setCurrentPage: (currentPageIndex) => {
        set({ currentPageIndex, selectedFrameId: null });
      },
      
      addPage: (template) => {
        const { project } = get();
        if (!project || !project.pagesJson) return;
        
        const newPage: Page = {
          id: `page-${Date.now()}`,
          templateKey: template.key,
          frames: template.frames.reduce((acc, frame) => {
            acc[frame.id] = {};
            return acc;
          }, {} as any),
        };
        
        const updatedPages = [...project.pagesJson, newPage];
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
            pageCount: updatedPages.length,
          },
        });
        get().saveToHistory();
      },
      
      deletePage: (index) => {
        const { project } = get();
        if (!project || !project.pagesJson || project.pagesJson.length <= 1) return;
        
        const updatedPages = project.pagesJson.filter((_, i) => i !== index);
        const newCurrentIndex = Math.min(index, updatedPages.length - 1);
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
            pageCount: updatedPages.length,
          },
          currentPageIndex: newCurrentIndex,
          selectedFrameId: null,
        });
        get().saveToHistory();
      },
      
      duplicatePage: (index) => {
        const { project } = get();
        if (!project || !project.pagesJson) return;
        
        const pageToDuplicate = project.pagesJson[index];
        const duplicatedPage: Page = {
          ...pageToDuplicate,
          id: `page-${Date.now()}`,
        };
        
        const updatedPages = [
          ...project.pagesJson.slice(0, index + 1),
          duplicatedPage,
          ...project.pagesJson.slice(index + 1),
        ];
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
            pageCount: updatedPages.length,
          },
        });
        get().saveToHistory();
      },
      
      reorderPages: (fromIndex, toIndex) => {
        const { project } = get();
        if (!project || !project.pagesJson) return;
        
        const updatedPages = [...project.pagesJson];
        const [movedPage] = updatedPages.splice(fromIndex, 1);
        updatedPages.splice(toIndex, 0, movedPage);
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
          },
        });
        get().saveToHistory();
      },
      
      selectFrame: (selectedFrameId) => set({ selectedFrameId }),
      
      setFrameAsset: (frameId, assetId) => {
        const { project, currentPageIndex } = get();
        if (!project || !project.pagesJson) return;
        
        const updatedPages = [...project.pagesJson];
        const currentPage = updatedPages[currentPageIndex];
        if (currentPage) {
          currentPage.frames[frameId] = {
            ...currentPage.frames[frameId],
            assetId: assetId || undefined,
          };
        }
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
          },
        });
        get().saveToHistory();
      },
      
      updateFrameCrop: (frameId, crop) => {
        const { project, currentPageIndex } = get();
        if (!project || !project.pagesJson) return;
        
        const updatedPages = [...project.pagesJson];
        const currentPage = updatedPages[currentPageIndex];
        if (currentPage) {
          currentPage.frames[frameId] = {
            ...currentPage.frames[frameId],
            crop,
          };
        }
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
          },
        });
      },
      
      updateFrameProperties: (frameId, properties) => {
        const { project, currentPageIndex } = get();
        if (!project || !project.pagesJson) return;
        
        const updatedPages = [...project.pagesJson];
        const currentPage = updatedPages[currentPageIndex];
        if (currentPage) {
          currentPage.frames[frameId] = {
            ...currentPage.frames[frameId],
            ...properties,
          };
        }
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
          },
        });
        get().saveToHistory();
      },
      
      addAsset: (asset) => {
        const { project } = get();
        if (!project) return;
        
        set({
          project: {
            ...project,
            assets: [...project.assets, asset],
          },
        });
      },
      
      removeAsset: (assetId) => {
        const { project } = get();
        if (!project) return;
        
        const updatedAssets = project.assets.filter(asset => asset.id !== assetId);
        
        // Remove asset from all frames
        const updatedPages = project.pagesJson?.map(page => ({
          ...page,
          frames: Object.fromEntries(
            Object.entries(page.frames).map(([frameId, frame]) => [
              frameId,
              frame.assetId === assetId ? { ...frame, assetId: undefined } : frame,
            ])
          ),
        }));
        
        set({
          project: {
            ...project,
            assets: updatedAssets,
            pagesJson: updatedPages,
          },
        });
        get().saveToHistory();
      },
      
      selectAsset: (selectedAssetId) => set({ selectedAssetId }),
      
      changePageTemplate: (pageIndex, template) => {
        const { project } = get();
        if (!project || !project.pagesJson) return;
        
        const updatedPages = [...project.pagesJson];
        const page = updatedPages[pageIndex];
        if (page) {
          page.templateKey = template.key;
          page.frames = template.frames.reduce((acc, frame) => {
            acc[frame.id] = page.frames[frame.id] || {};
            return acc;
          }, {} as any);
        }
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
          },
        });
        get().saveToHistory();
      },
      
      autoLayoutPage: (pageIndex) => {
        const { project } = get();
        if (!project || !project.pagesJson) return;
        
        const page = project.pagesJson[pageIndex];
        if (!page) return;
        
        // Get unused assets
        const usedAssetIds = new Set(
          Object.values(page.frames)
            .map(frame => frame.assetId)
            .filter(Boolean)
        );
        const unusedAssets = project.assets.filter(asset => !usedAssetIds.has(asset.id));
        
        // Fill frames with unused assets
        const frameIds = Object.keys(page.frames);
        const updatedPages = [...project.pagesJson];
        const updatedPage = { ...updatedPages[pageIndex] };
        
        frameIds.forEach((frameId, index) => {
          if (unusedAssets[index]) {
            updatedPage.frames[frameId] = {
              ...updatedPage.frames[frameId],
              assetId: unusedAssets[index].id,
            };
          }
        });
        
        updatedPages[pageIndex] = updatedPage;
        
        set({
          project: {
            ...project,
            pagesJson: updatedPages,
          },
        });
        get().saveToHistory();
      },
      
      autoLayoutAllPages: () => {
        const { project } = get();
        if (!project || !project.pagesJson) return;
        
        project.pagesJson.forEach((_, index) => {
          get().autoLayoutPage(index);
        });
      },
      
      saveToHistory: () => {
        const { project, history, historyIndex } = get();
        if (!project || !project.pagesJson) return;
        
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(project.pagesJson)));
        
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      undo: () => {
        const { history, historyIndex, project } = get();
        if (historyIndex > 0 && project) {
          const newIndex = historyIndex - 1;
          set({
            historyIndex: newIndex,
            project: {
              ...project,
              pagesJson: JSON.parse(JSON.stringify(history[newIndex])),
            },
          });
        }
      },
      
      redo: () => {
        const { history, historyIndex, project } = get();
        if (historyIndex < history.length - 1 && project) {
          const newIndex = historyIndex + 1;
          set({
            historyIndex: newIndex,
            project: {
              ...project,
              pagesJson: JSON.parse(JSON.stringify(history[newIndex])),
            },
          });
        }
      },
      
      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },
      
      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },
      
      setSaving: (isSaving) => set({ isSaving }),
      setLastSaved: (lastSaved) => set({ lastSaved }),
      togglePrintSafe: () => {
        const { showPrintSafe } = get();
        set({ showPrintSafe: !showPrintSafe });
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'editor-store',
    }
  )
);
