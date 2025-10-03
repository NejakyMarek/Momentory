'use client';

import { useEditorStore } from '@/lib/editorStore';
import { getTemplate } from '@/lib/albumTemplates';
import { Stage, Layer, Group, Rect, Image as KonvaImage } from 'react-konva';
import { useRef, useEffect, useState } from 'react';
import { DndContext, useDroppable } from '@dnd-kit/core';

interface FrameProps {
  frame: any;
  template: any;
  asset?: any;
  isSelected: boolean;
  onSelect: () => void;
}

function Frame({ frame, template, asset, isSelected, onSelect }: FrameProps) {
  const { setNodeRef } = useDroppable({
    id: `frame-${frame.id}`,
  });

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (asset?.url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setImage(img);
      img.src = asset.url;
    } else {
      setImage(null);
    }
  }, [asset?.url]);

  const frameData = template.frames.find((f: any) => f.id === frame.id);
  if (!frameData) return null;

  return (
    <Group
      onClick={onSelect}
      onTap={onSelect}
    >
      {/* Frame background */}
      <Rect
        x={frameData.x * 800}
        y={frameData.y * 600}
        width={frameData.w * 800}
        height={frameData.h * 600}
        fill={isSelected ? '#3b82f6' : '#e5e7eb'}
        stroke={isSelected ? '#1d4ed8' : '#9ca3af'}
        strokeWidth={isSelected ? 3 : 1}
        cornerRadius={4}
      />
      
      {/* Image */}
      {image && (
        <KonvaImage
          image={image}
          x={frameData.x * 800}
          y={frameData.y * 600}
          width={frameData.w * 800}
          height={frameData.h * 600}
          cornerRadius={4}
        />
      )}
      
      {/* Empty state */}
      {!image && (
        <Rect
          x={frameData.x * 800 + 10}
          y={frameData.y * 600 + 10}
          width={frameData.w * 800 - 20}
          height={frameData.h * 600 - 20}
          fill="transparent"
          stroke="#9ca3af"
          strokeWidth={1}
          dash={[5, 5]}
          cornerRadius={2}
        />
      )}
    </Group>
  );
}

export function EditorCanvas() {
  const {
    project,
    currentPageIndex,
    selectedFrameId,
    selectFrame,
    setFrameAsset,
    showPrintSafe,
  } = useEditorStore();

  const stageRef = useRef<any>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [braveShieldWarning, setBraveShieldWarning] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const container = stageRef.current?.container();
      if (container) {
        const rect = container.getBoundingClientRect();
        setStageSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Detect Brave browser and show warning
  useEffect(() => {
    const isBrave = (navigator as any).brave && (navigator as any).brave.isBrave;
    if (isBrave) {
      setBraveShieldWarning(true);
    }
  }, []);

  if (!project || !project.pagesJson) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No project loaded</p>
      </div>
    );
  }

  const currentPage = project.pagesJson[currentPageIndex];
  if (!currentPage) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  const template = getTemplate(currentPage.templateKey);
  if (!template) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Invalid template</p>
      </div>
    );
  }

  const handleFrameSelect = (frameId: string) => {
    selectFrame(frameId);
  };

  const handleFrameDrop = (frameId: string, assetId: string) => {
    setFrameAsset(frameId, assetId);
  };

  return (
    <div className="h-full flex items-center justify-center bg-muted/20">
      {braveShieldWarning && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <div className="flex items-center">
            <div className="flex-1">
              <strong>Brave Browser Detected:</strong> Please disable Brave Shield for this site to ensure the editor works properly. 
              Click the Brave Shield icon in the address bar and turn off "Shields" for this site.
            </div>
            <button 
              onClick={() => setBraveShieldWarning(false)}
              className="ml-4 text-yellow-700 hover:text-yellow-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <DndContext
        onDragEnd={(event) => {
          const { active, over } = event;
          if (over && active.id !== over.id) {
            handleFrameDrop(over.id as string, active.id as string);
          }
        }}
      >
        <div className="relative">
          {/* Print Safe Overlay */}
          {showPrintSafe && (
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-4 border-2 border-red-500 border-dashed opacity-50">
                <div className="absolute -top-6 left-0 text-xs text-red-500 font-medium">
                  Print Safe Area
                </div>
              </div>
            </div>
          )}

          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={Math.min(stageSize.width / 800, stageSize.height / 600)}
            scaleY={Math.min(stageSize.width / 800, stageSize.height / 600)}
          >
            <Layer>
              {/* Page background */}
              <Rect
                x={0}
                y={0}
                width={800}
                height={600}
                fill="white"
                stroke="#e5e7eb"
                strokeWidth={2}
              />

              {/* Frames */}
              {template.frames.map((frame) => {
                const frameData = currentPage.frames[frame.id];
                const asset = frameData?.assetId
                  ? project.assets.find(a => a.id === frameData.assetId)
                  : undefined;

                return (
                  <Frame
                    key={frame.id}
                    frame={frame}
                    template={template}
                    asset={asset}
                    isSelected={selectedFrameId === frame.id}
                    onSelect={() => handleFrameSelect(frame.id)}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
      </DndContext>
    </div>
  );
}
