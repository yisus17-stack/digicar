'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommitHorizontal, Users, Fuel } from 'lucide-react';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out group">
        <div className="relative aspect-video overflow-hidden bg-gray-50">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={`${car.brand} ${car.model}`}
              fill
              className={cn(
                "object-cover group-hover:scale-105 transition-transform duration-300",
                !placeholder.imageUrl.includes('unsplash') && 'object-contain'
              )}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              data-ai-hint={placeholder.imageHint}
              priority={true}
            />
          )}
        </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <p className="text-xl font-bold leading-tight">{car.model}</p>
        <p className="text-sm text-muted-foreground normal-case mt-1">
          {car.brand} - {translations.type[car.type as keyof typeof translations.type]}
        </p>
        <div className="text-base mt-2 mb-4">
            <span>{car.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
        </div>
        <div className="flex flex-col md:flex-row text-sm text-muted-foreground border-t pt-3 mt-auto space-y-2 md:space-y-0">
          <div className="flex items-center gap-2 md:w-1/3">
            <GitCommitHorizontal className="w-4 h-4" />
            <span>{translations.transmission[car.transmission]}</span>
          </div>
          <div className="flex items-center gap-2 md:w-1/3">
            <Fuel className="w-4 h-4" />
            <span>{translations.fuelType[car.fuelType]}</span>
          </div>
          <div className="flex items-center gap-2 md:w-1/3 md:justify-end">
            <Users className="w-4 h-4" />
            <span>{car.passengers} Pasajeros</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
