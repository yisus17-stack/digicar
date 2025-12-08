
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Car } from '@/core/types';
import { Car as CarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface CarCardProps {
  car: Car;
  showFavoriteButton?: boolean;
  preselectedVariantId?: string;
  showColorName?: boolean;
}

export default function CarCard({ car, showFavoriteButton = true, preselectedVariantId, showColorName = false }: CarCardProps) {
  const router = useRouter();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const displayVariant = useMemo(() => {
    if (preselectedVariantId) {
      return car.variantes?.find(v => v.id === preselectedVariantId) ?? car.variantes?.[0];
    }
    return car.variantes?.[0];
  }, [car, preselectedVariantId]);
  
  if (!car) {
    return null;
  }
  
  const imageUrl = displayVariant?.imagenUrl ?? car.imagenUrl;
  const price = displayVariant?.precio ?? car.precio ?? 0;
  const colorName = displayVariant?.color;
  const colorCount = car.variantes?.length || 1;

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
      <Link
        href={`/catalogo/auto/${car.id}`}
        className="group"
      >
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted relative p-4">
            {!isImageLoaded && <Skeleton className="absolute inset-0 rounded-lg" />}
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${car.marca} ${car.modelo}`}
                width={400}
                height={400}
                className={cn(
                  "h-full w-full object-contain object-center transition-all duration-300 ease-in-out group-hover:scale-105",
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                draggable="false"
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <CarIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
        </div>
        <div className="pt-4">
          <h3 className="text-base font-semibold text-foreground">
            {car.marca} {car.modelo}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {car.tipo} • {car.anio}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
             {showColorName && colorName ? colorName : `${colorCount} ${colorCount > 1 ? 'colores' : 'color'}`}
          </p>
          <p className="mt-2 text-base font-semibold text-foreground">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>
  );
}
