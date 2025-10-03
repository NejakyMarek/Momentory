'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/editorStore';
import { getTemplate, TEMPLATES } from '@/lib/albumTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RotateCcw, ZoomIn, ZoomOut, Move, Crop } from 'lucide-react';
import { CropModal } from './CropModal';

export function PropertiesPanel() {
  const {
    project,
    currentPageIndex,
    selectedFrameId,
    selectedAssetId,
    selectAsset,
    changePageTemplate,
    updateFrameProperties,
    autoLayoutPage,
    autoLayoutAllPages,
  } = useEditorStore();

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  if (!project || !project.pagesJson) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">No project loaded</p>
      </div>
    );
  }

  const currentPage = project.pagesJson[currentPageIndex];
  if (!currentPage) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">No page selected</p>
      </div>
    );
  }

  const template = getTemplate(currentPage.templateKey);
  const selectedFrame = selectedFrameId ? currentPage.frames[selectedFrameId] : null;
  const selectedAsset = selectedAssetId ? project.assets.find(a => a.id === selectedAssetId) : null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Page Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Page Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select
                value={currentPage.templateKey}
                onValueChange={(value) => {
                  const newTemplate = getTemplate(value);
                  if (newTemplate) {
                    changePageTemplate(currentPageIndex, newTemplate);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.key} value={template.key}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => autoLayoutPage(currentPageIndex)}
                className="w-full"
              >
                Auto-layout Page
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={autoLayoutAllPages}
                className="w-full"
              >
                Auto-layout All Pages
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Frame Properties */}
        {selectedFrameId && selectedFrame && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Frame Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Asset</label>
                <Select
                  value={selectedFrame.assetId || ''}
                  onValueChange={(value) => {
                    updateFrameProperties(selectedFrameId, {
                      assetId: value || undefined,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No asset</SelectItem>
                    {project.assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.url.split('/').pop()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fit</label>
                <Select
                  value={selectedFrame.fit || 'cover'}
                  onValueChange={(value) => {
                    updateFrameProperties(selectedFrameId, {
                      fit: value as 'cover' | 'contain',
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Cover</SelectItem>
                    <SelectItem value="contain">Contain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Alignment</label>
                <Select
                  value={selectedFrame.alignment || 'center'}
                  onValueChange={(value) => {
                    updateFrameProperties(selectedFrameId, {
                      alignment: value as any,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedFrame.crop && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Scale: {selectedFrame.crop.scale.toFixed(2)}
                    </label>
                    <Slider
                      value={[selectedFrame.crop.scale]}
                      onValueChange={([value]) => {
                        updateFrameProperties(selectedFrameId, {
                          crop: {
                            ...selectedFrame.crop,
                            scale: value,
                          },
                        });
                      }}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Rotation: {selectedFrame.crop.rotation}°
                    </label>
                    <Slider
                      value={[selectedFrame.crop.rotation]}
                      onValueChange={([value]) => {
                        updateFrameProperties(selectedFrameId, {
                          crop: {
                            ...selectedFrame.crop,
                            rotation: value,
                          },
                        });
                      }}
                      min={-180}
                      max={180}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCropModalOpen(true)}
                      className="w-full"
                    >
                      <Crop className="h-4 w-4 mr-2" />
                      Crop Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateFrameProperties(selectedFrameId, {
                          crop: {
                            scale: 1,
                            offsetX: 0,
                            offsetY: 0,
                            rotation: 0,
                          },
                        });
                      }}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Transform
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="bleed"
                  checked={selectedFrame.bleed || false}
                  onChange={(e) => {
                    updateFrameProperties(selectedFrameId, {
                      bleed: e.target.checked,
                    });
                  }}
                />
                <label htmlFor="bleed" className="text-sm">
                  Enable bleed
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Asset Properties */}
        {selectedAsset && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Asset Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square bg-muted rounded overflow-hidden">
                <img
                  src={selectedAsset.url}
                  alt="Selected asset"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span>{selectedAsset.width} × {selectedAsset.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span>{(selectedAsset.url.split('/').pop() || '').length} chars</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => selectAsset(null)}
                className="w-full"
              >
                Deselect Asset
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!selectedFrameId && !selectedAssetId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Click on a frame to select it</p>
              <p>• Drag assets from the tray to frames</p>
              <p>• Use the page thumbnails to navigate</p>
              <p>• Change templates from the dropdown</p>
              <p>• Use auto-layout to fill pages quickly</p>
            </CardContent>
          </Card>
        )}

        {/* Crop Modal */}
        {selectedFrameId && selectedFrame?.assetId && (
          <CropModal
            isOpen={isCropModalOpen}
            onClose={() => setIsCropModalOpen(false)}
            imageUrl={project.assets.find(a => a.id === selectedFrame.assetId)?.url || ''}
            onCropComplete={(crop) => {
              updateFrameProperties(selectedFrameId, { crop });
            }}
            initialCrop={selectedFrame.crop}
          />
        )}
      </div>
    </div>
  );
}
