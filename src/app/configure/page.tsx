'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const VARIANTS = [
  { id: 'classic', name: 'Classic', description: 'Timeless design with clean lines' },
  { id: 'modern', name: 'Modern', description: 'Contemporary style with bold layouts' },
  { id: 'vintage', name: 'Vintage', description: 'Retro-inspired with warm tones' },
];

const SIZES = [
  { id: '8x8', name: '8" × 8"', price: 25 },
  { id: '10x10', name: '10" × 10"', price: 35 },
  { id: '12x12', name: '12" × 12"', price: 45 },
];

export default function ConfigurePage() {
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [basePages, setBasePages] = useState(20);
  const [isCreating, setIsCreating] = useState(false);

  const selectedSizeData = SIZES.find(size => size.id === selectedSize);
  const totalPrice = selectedSizeData ? selectedSizeData.price + (basePages * 5) : 0;

  const handleStartEditor = async () => {
    if (!selectedVariant || !selectedSize) {
      alert('Please select both variant and size');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantId: selectedVariant,
          size: selectedSize,
          basePages,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const { id } = await response.json();
      router.push(`/editor/${id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Configure Your Album</h1>
        <p className="text-lg text-muted-foreground">
          Choose your style, size, and page count to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Variant Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Album Style</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {VARIANTS.map((variant) => (
              <div
                key={variant.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedVariant === variant.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedVariant(variant.id)}
              >
                <h3 className="font-semibold">{variant.name}</h3>
                <p className="text-sm text-muted-foreground">{variant.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Size Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Album Size</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SIZES.map((size) => (
              <div
                key={size.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSize === size.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedSize(size.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{size.name}</h3>
                    <p className="text-sm text-muted-foreground">Base price: ${size.price}</p>
                  </div>
                  <div className="text-lg font-bold">${size.price}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Page Count */}
      <Card>
        <CardHeader>
          <CardTitle>Page Count</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <label htmlFor="pages" className="text-sm font-medium">
              Number of pages:
            </label>
            <Input
              id="pages"
              type="number"
              min="20"
              max="120"
              step="2"
              value={basePages}
              onChange={(e) => setBasePages(parseInt(e.target.value) || 20)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">
              (20-120 pages, step of 2)
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Additional pages: ${(basePages - 20) * 5} (${5} per page)
          </p>
        </CardContent>
      </Card>

      {/* Price Summary */}
      {selectedSizeData && (
        <Card>
          <CardHeader>
            <CardTitle>Price Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base price ({selectedSizeData.name}):</span>
                <span>${selectedSizeData.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Pages ({basePages} × $5):</span>
                <span>${basePages * 5}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Editor Button */}
      <div className="text-center">
        <Button
          onClick={handleStartEditor}
          disabled={!selectedVariant || !selectedSize || isCreating}
          size="lg"
          className="px-8"
        >
          {isCreating ? 'Creating...' : 'Start Editor'}
        </Button>
      </div>
    </div>
  );
}
