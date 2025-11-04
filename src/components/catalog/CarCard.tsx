'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommitHorizontal, Users, Fuel, Eye, GitCompareArrows } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import { Button } from '../ui/button';
import Link from 'next/link';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2">
      <div className="absolute top-3 right-3 z-10 rounded-full bg-background/80 px-3 py-1 text-sm font-semibold backdrop-blur-sm transition-opacity duration-300">
        {car.year}
      </div>

      <div className="relative aspect-video overflow-hidden bg-gray-50">
        {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            className={cn(
              'object-cover transition-transform duration-300 group-hover:scale-110',
              !placeholder.imageUrl.includes('unsplash') && 'object-contain'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={placeholder.imageHint}
            priority={true}
          />
        )}
      </div>

      <CardContent className="flex flex-grow flex-col p-4">
        <div>
          <p className="text-xl font-bold leading-tight truncate">{car.model}</p>
          <p className="text-sm text-muted-foreground">
            {car.brand} - {translations.type[car.type as keyof typeof translations.type]}
          </p>
        </div>

        <div className="mt-4 mb-4">
          <p className="text-2xl font-extrabold text-primary">
            {car.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>

        <div className="border-t pt-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <GitCommitHorizontal className="h-5 w-5" />
              <span>{translations.transmission[car.transmission]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-5 w-5" />
              <span>{translations.fuelType[car.fuelType]}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-5 w-5" />
              <span className="whitespace-nowrap">{car.passengers} Pasajeros</span>
            </div>
          </div>
        </div>

        <div className="mt-auto border-t pt-4 flex w-full gap-2">
            <Button asChild className="w-full">
                <Link href={`/car/${car.id}`}>
                <Eye className="mr-2" /> Ver Detalles
                </Link>
            </Button>
            <Button variant="secondary" size="icon" asChild>
                <Link href={`/compare?ids=${car.id}`}>
                <GitCompareArrows />
                <span className="sr-only">Comparar</span>
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
