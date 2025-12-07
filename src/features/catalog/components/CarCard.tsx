
'use client';

import { useState, useEffect, useMemo, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import type { Car, Favorite } from '@/core/types';
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
        className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300 hover:shadow-lg"
      >
        {/* Encabezado */}
        <div className="flex justify-between items-start p-4">
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
              className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary z-20 transition-colors group-hover:text-primary"
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
        <div className="my-auto flex h-48 w-full items-center justify-center py-4 px-4">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${car.marca} ${car.modelo}`}
              width={300}
              height={300}
              className="h-auto max-h-full w-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-110"
              draggable="false"
            />
          ) : (
            <CarIcon className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        
        {/* Superposición Azul Interactiva */}
        <div className="absolute bottom-0 left-0 right-0 h-2/5 translate-y-full rounded-b-lg bg-gradient-to-t from-primary/90 to-primary/80 backdrop-blur-sm transition-all duration-500 ease-in-out group-hover:translate-y-0">
          <div className="flex h-full flex-col justify-center items-center p-4 text-primary-foreground">
              <div className="flex w-full justify-around items-center text-sm">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-center gap-1.5 opacity-0 transition-opacity duration-300 delay-200 group-hover:opacity-100">
                    <spec.icon className="h-4 w-4" />
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center opacity-0 transition-opacity duration-300 delay-300 group-hover:opacity-100">
                  <p className="text-2xl font-bold tracking-tight">
                      ${price.toLocaleString('es-MX')}
                  </p>
              </div>
          </div>
        </div>

        {/* Precio visible por defecto (oculto en hover) */}
        <div className="p-4 mt-auto transition-opacity duration-300 group-hover:opacity-0">
          <p className="text-xl font-bold text-foreground">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>
  );
}
