
'use client';

import { useState, useEffect, useMemo, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import type { Car, Favorite, Marca } from '@/core/types';
import { Car as CarIcon, Heart, Loader2, Droplets, GitMerge, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CarCardProps {
  car: Car;
  showFavoriteButton?: boolean;
  preselectedVariantId?: string;
}

export default function CarCard({ car, showFavoriteButton = true, preselectedVariantId }: CarCardProps) {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  
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
  const colorCount = car.variantes?.length || 1;

  return (
      <Link
        href={`/catalogo/auto/${car.id}`}
        className="group"
      >
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted p-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${car.marca} ${car.modelo}`}
                width={400}
                height={400}
                className="h-full w-full object-contain object-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                draggable="false"
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
            {colorCount} {colorCount > 1 ? 'colores' : 'color'}
          </p>
          <p className="mt-2 text-base font-semibold text-foreground">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>
  );
}
