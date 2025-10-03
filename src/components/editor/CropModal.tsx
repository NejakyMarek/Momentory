'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { X, RotateCcw } from 'lucide-react';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (crop: {
    scale: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  }) => void;
  initialCrop?: {
    scale: number;
    offsetX: number;
    offsetY: number;
    rotation: number;
  };
}

export function CropModal({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
  initialCrop = { scale: 1, offsetX: 0, offsetY: 0, rotation: 0 },
}: CropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialCrop.scale);
  const [rotation, setRotation] = useState(initialCrop.rotation);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  if (!isOpen) return null;

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = () => {
    onCropComplete({
      scale: zoom,
      offsetX: crop.x,
      offsetY: crop.y,
      rotation,
    });
    onClose();
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Crop Image</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative h-96 bg-muted rounded overflow-hidden">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Zoom: {zoom.toFixed(2)}
              </label>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Rotation: {rotation}°
              </label>
              <Slider
                value={[rotation]}
                onValueChange={([value]) => setRotation(value)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Apply Crop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
