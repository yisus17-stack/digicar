
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
    <div className="group relative">
      <Link
        href={`/catalogo/auto/${car.id}`}
        className="flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-lg"
      >
        <div className="h-48 w-full flex items-center justify-center p-6 bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${car.marca} ${car.modelo}`}
              width={300}
              height={300}
              className="h-40 w-auto object-contain"
              draggable="false"
            />
          ) : (
            <CarIcon className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-col px-4 py-4 flex-grow">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{car.marca} {car.modelo}</h3>
            <p className="text-base text-muted-foreground">
              {car.anio} • {car.tipo}
            </p>
          </div>
          <p className="mt-4 pt-2 text-lg font-bold">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>

      {showFavoriteButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFavorite}
          disabled={isUpdating || loadingUser || loadingFavorites}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/60 p-2 text-foreground/80 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary hover:bg-background h-9 w-9"
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
  );
}
