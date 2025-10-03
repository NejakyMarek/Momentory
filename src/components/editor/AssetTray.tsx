'use client';

import { useState, useRef } from 'react';
import { useEditorStore } from '@/lib/editorStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableAssetProps {
  asset: any;
  onDelete: (assetId: string) => void;
}

function DraggableAsset({ asset, onDelete }: DraggableAssetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: asset.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative group cursor-grab ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="w-20 h-20 p-1 overflow-hidden">
        <img
          src={asset.url}
          alt="Asset"
          className="w-full h-full object-cover rounded"
        />
        <Button
          variant="destructive"
          size="sm"
          className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(asset.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </Card>
    </div>
  );
}

export function AssetTray() {
  const { project, addAsset, removeAsset } = useEditorStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Upload to Vercel Blob
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Upload failed');
        }

        const uploadData = await uploadResponse.json();

        // Get image dimensions
        const img = new Image();
        img.onload = async () => {
          // Create asset record
          const assetResponse = await fetch(`/api/projects/${project?.id}/assets`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: uploadData.url,
              storageKey: uploadData.storageKey,
              width: img.width,
              height: img.height,
            }),
          });

          if (assetResponse.ok) {
            const { asset } = await assetResponse.json();
            addAsset(asset);
          }
        };
        img.src = uploadData.url;
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        removeAsset(assetId);
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };

  if (!project) {
    return null;
  }

  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Assets</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {project.assets.map((asset) => (
          <DraggableAsset
            key={asset.id}
            asset={asset}
            onDelete={handleDeleteAsset}
          />
        ))}
        
        {project.assets.length === 0 && (
          <div className="flex items-center justify-center w-full h-16 text-muted-foreground text-sm">
            No assets uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}
