
'use client';

import { useState, useEffect, useMemo, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import type { Car, Favorite, FavoriteItem } from '@/core/types';
import { Car as CarIcon, Heart, Loader2 } from 'lucide-react';
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
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const refFavoritos = useMemoFirebase(() => user ? doc(firestore, 'favoritos', user.uid) : null, [user, firestore]);
  const { data: favoritos, isLoading: loadingFavorites } = useDoc<Favorite>(refFavoritos);

  const displayVariant = useMemo(() => {
    if (preselectedVariantId) {
      return car.variantes?.find(v => v.id === preselectedVariantId) ?? car.variantes?.[0];
    }
    return car.variantes?.[0];
  }, [car, preselectedVariantId]);
  
  useEffect(() => {
    if (!favoritos?.items || !displayVariant) {
      setIsFavorite(false);
      return;
    }
    const isFav = favoritos.items.some(item => item.autoId === car.id && item.varianteId === displayVariant.id);
    setIsFavorite(isFav);
  }, [favoritos, car.id, displayVariant]);

  if (!car) {
    return null;
  }
  
  const imageUrl = displayVariant?.imagenUrl ?? car.imagenUrl;
  const price = displayVariant?.precio ?? car.precio ?? 0;

  const handleToggleFavorite = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }
    if (!refFavoritos || !displayVariant) return;

    setIsUpdating(true);
    const favoriteItem: FavoriteItem = { autoId: car.id, varianteId: displayVariant.id };
    
    try {
      if (isFavorite) {
        await updateDoc(refFavoritos, { items: arrayRemove(favoriteItem) });
      } else {
        if (favoritos) {
           await updateDoc(refFavoritos, { items: arrayUnion(favoriteItem) });
        } else {
           await setDoc(refFavoritos, { items: [favoriteItem] });
        }
      }
    } catch (error) {
      console.error("Error updating favorites from card:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
      <Link
        href={`/catalogo/auto/${car.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-lg"
      >
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold">{car.marca} {car.modelo}</h3>
          {showFavoriteButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              disabled={isUpdating || loadingUser || loadingFavorites}
              className="h-8 w-8 rounded-full text-foreground/80 hover:text-primary hover:bg-background"
            >
              {isUpdating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart className={cn("h-5 w-5", isFavorite && "fill-current text-primary")} />
              )}
              <span className="sr-only">Añadir a favoritos</span>
            </Button>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
            {car.anio} • {car.tipo}
        </p>

        <div className="my-auto flex h-40 w-full items-center justify-center py-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${car.marca} ${car.modelo}`}
              width={300}
              height={300}
              className="h-auto max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              draggable="false"
            />
          ) : (
            <CarIcon className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        <div className="flex items-end justify-between mt-auto">
          <p className="text-2xl font-bold text-primary">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>
  );
}
