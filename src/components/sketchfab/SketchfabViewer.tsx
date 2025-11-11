'use client';

import { useEffect, useState } from 'react';
import { fetchSketchfabModel } from '@/app/actions/sketchfab';
import { Skeleton } from '../ui/skeleton';
import { AspectRatio } from '../ui/aspect-ratio';

interface SketchfabViewerProps {
  make: string;
  model: string;
}

export default function SketchfabViewer({ make, model }: SketchfabViewerProps) {
  const [modelUid, setModelUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getModel() {
      setIsLoading(true);
      const uid = await fetchSketchfabModel(make, model);
      setModelUid(uid);
      setIsLoading(false);
    }
    getModel();
  }, [make, model]);

  if (isLoading) {
    return (
      <AspectRatio ratio={16 / 9} className="w-full">
        <Skeleton className="w-full h-full rounded-lg" />
      </AspectRatio>
    );
  }

  if (!modelUid) {
    return (
      <AspectRatio ratio={16/9}>
        <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg">
          <p className="text-muted-foreground">Modelo 3D no disponible.</p>
        </div>
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9} className="w-full">
      <iframe
        title={`${make} ${model} 3D model`}
        src={`https://sketchfab.com/models/${modelUid}/embed?autostart=1&ui_controls=1&ui_infos=0&ui_inspector=0&ui_stop=1&ui_watermark=0`}
        allow="autoplay; fullscreen; vr"
        className="w-full h-full border-0 rounded-lg"
      ></iframe>
    </AspectRatio>
  );
}
