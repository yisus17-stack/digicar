
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Car as CarIcon, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  if (!car) {
    return null;
  }
  
  // Use the first variant for display, or fallback to deprecated fields
  const displayVariant = car.variantes && car.variantes.length > 0 ? car.variantes[0] : null;
  const imageUrl = displayVariant?.imagenUrl ?? car.imagenUrl;
  const price = displayVariant?.precio ?? car.precio ?? 0;

  return (
    <div className="group relative">
        <Link
        href={`/catalogo/auto/${car.id}`}
        className="flex h-full flex-col overflow-hidden rounded-lg bg-card transition-all duration-300 hover:shadow-md"
        >
        {/* IMAGEN */}
        <div className="h-56 w-full flex items-center justify-center p-6 bg-muted">
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

        {/* TEXTO */}
        <div className="flex flex-col px-4 py-4 flex-grow">
            <div className="flex-grow">
            <h3 className="text-lg font-semibold">{car.marca} {car.modelo}</h3>
            <p className="text-base text-muted-foreground">
                {car.tipo} • {car.anio}
            </p>
            </div>
            <p className="mt-4 pt-2 text-lg font-bold">
            ${price.toLocaleString('es-MX')}
            </p>
        </div>
        </Link>
         <button className="absolute top-2 right-2 z-10 rounded-full bg-background/60 p-2 text-foreground/80 opacity-0 transition-opacity group-hover:opacity-100 hover:text-primary hover:bg-background">
            <Heart className="h-5 w-5" />
            <span className="sr-only">Añadir a favoritos</span>
        </button>
    </div>
  );
}
