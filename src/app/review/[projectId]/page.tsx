'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTemplate } from '@/lib/albumTemplates';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import { useRef } from 'react';

interface Project {
  id: string;
  status: string;
  variantId: string;
  size: string;
  pageCount: number;
  pagesJson: any[];
  priceCents: number;
  currency: string;
  assets: any[];
}

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        
        const projectData = await response.json();
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleCheckout = async () => {
    if (!project) return;

    try {
      // Update project status to ready
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ready',
        }),
      });

      // Redirect to existing checkout flow
      router.push(`/checkout?projectId=${project.id}&quantity=${quantity}`);
    } catch (error) {
      console.error('Error preparing checkout:', error);
      alert('Failed to prepare checkout. Please try again.');
    }
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const totalPrice = project ? project.priceCents * quantity : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-4">Error Loading Project</h2>
          <p className="text-muted-foreground mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  const currentPage = project.pagesJson[currentPageIndex];
  const template = currentPage ? getTemplate(currentPage.templateKey) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Review Your Album</h1>
          <p className="text-muted-foreground">
            Review your album before proceeding to checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Album Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Page Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                    disabled={currentPageIndex === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPageIndex + 1} of {project.pageCount}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPageIndex(Math.min(project.pageCount - 1, currentPageIndex + 1))}
                    disabled={currentPageIndex === project.pageCount - 1}
                  >
                    Next
                  </Button>
                </div>

                {/* Canvas Preview */}
                <div className="flex justify-center">
                  <div className="border rounded-lg overflow-hidden bg-white">
                    <Stage
                      ref={stageRef}
                      width={400}
                      height={300}
                      scaleX={0.5}
                      scaleY={0.5}
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
                        {template?.frames.map((frame) => {
                          const frameData = currentPage.frames[frame.id];
                          const asset = frameData?.assetId
                            ? project.assets.find(a => a.id === frameData.assetId)
                            : undefined;

                          return (
                            <Rect
                              key={frame.id}
                              x={frame.x * 800}
                              y={frame.y * 600}
                              width={frame.w * 800}
                              height={frame.h * 600}
                              fill="#f3f4f6"
                              stroke="#d1d5db"
                              strokeWidth={1}
                              cornerRadius={4}
                            />
                          );
                        })}
                      </Layer>
                    </Stage>
                  </div>
                </div>

                {/* Page Thumbnails */}
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {project.pagesJson.map((page, index) => (
                    <div
                      key={page.id}
                      className={`flex-shrink-0 w-16 h-20 border rounded cursor-pointer ${
                        index === currentPageIndex ? 'border-primary' : 'border-border'
                      }`}
                      onClick={() => setCurrentPageIndex(index)}
                    >
                      <div className="w-full h-full bg-muted flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Variant:</span>
                    <span className="capitalize">{project.variantId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Size:</span>
                    <span>{project.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pages:</span>
                    <span>{project.pageCount}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Price per album:</span>
                    <span>{formatPrice(project.priceCents)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <label htmlFor="quantity" className="text-sm font-medium">
                      Quantity:
                    </label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="10"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(project.createdAt || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assets:</span>
                  <span>{project.assets.length} images</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
