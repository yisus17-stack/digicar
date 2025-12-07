
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
    const favoriteItem = { autoId: car.id, varianteId: displayVariant.id };
    
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

  const specs = [
    { icon: Droplets, value: car.tipoCombustible },
    { icon: GitMerge, value: car.transmision },
    { icon: Users, value: `${car.pasajeros}p` },
  ];

  return (
      <Link
        href={`/catalogo/auto/${car.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-lg border-l-4 border-l-primary"
      >
        <div className="flex flex-col flex-grow p-4">
          {/* Encabezado */}
          <div className="flex justify-between items-start">
              <div className='flex-1'>
                  <h3 className="text-xl font-bold">{car.marca} {car.modelo}</h3>
                  <p className="text-sm text-muted-foreground">
                      {car.anio} • {car.tipo}
                  </p>
              </div>
            {showFavoriteButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={isUpdating || loadingUser || loadingFavorites}
                className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary z-20 transition-colors"
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
          
          {/* Contenedor de Imagen */}
          <div className="my-auto flex flex-grow items-center justify-center py-4">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`${car.marca} ${car.modelo}`}
                width={300}
                height={200}
                className="h-auto max-h-48 w-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                draggable="false"
              />
            ) : (
              <CarIcon className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {/* Pie de tarjeta */}
        <div className="rounded-b-lg border-t p-4">
            <div className="flex w-full justify-around items-center text-sm mb-3 text-muted-foreground">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <spec.icon className="h-4 w-4" />
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
            <div className="text-left">
                <p className="text-2xl font-bold tracking-tight text-primary">
                    ${price.toLocaleString('es-MX')}
                </p>
            </div>
        </div>
      </Link>
  );
}
