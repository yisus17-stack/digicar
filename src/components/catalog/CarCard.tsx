'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommitHorizontal, Users, Fuel } from 'lucide-react';
import { Button } from '../ui/button';
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
        <div className="text-xs uppercase text-muted-foreground">{car.brand}</div>
        <p className="text-lg font-bold mb-2 leading-tight">{car.model}</p>
        <div className="text-primary font-bold text-base mb-4">
            <span>{car.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground border-t pt-3 mb-4">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="w-4 h-4" />
            <span>{translations.transmission[car.transmission]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            <span>{translations.fuelType[car.fuelType]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{car.passengers} Pasajeros</span>
          </div>
        </div>
        <Button size="sm" className="w-full mt-auto">Ver detalles</Button>
      </CardContent>
    </Card>
  );
}
