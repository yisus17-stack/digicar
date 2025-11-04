'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommitHorizontal, Users, Fuel } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  const transmissionMap = {
    'Automatic': 'Automática',
    'Manual': 'Manual'
  }

  const fuelTypeMap = {
    'Gasoline': 'Gasolina',
    'Diesel': 'Diésel',
    'Electric': 'Eléctrico',
    'Hybrid': 'Híbrido'
  }

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg duration-300 ease-in-out group">
        <div className="overflow-hidden aspect-video bg-gray-50">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={`${car.brand} ${car.model}`}
              width={600}
              height={400}
              className={cn(
                "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                !placeholder.imageUrl.includes('unsplash') && 'object-contain'
              )}
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="text-sm uppercase text-muted-foreground">{car.brand}</div>
        <p className="text-lg font-bold mb-2">{car.model}</p>
        <div className="flex items-center justify-between text-primary font-bold text-lg mb-4">
            <span>{car.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{transmissionMap[car.transmission]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{fuelTypeMap[car.fuelType]}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-4 sm:h-4" />
            <span>{car.passengers} Pasajeros</span>
          </div>
        </div>
        <Button className="w-full mt-4">Ver detalles</Button>
      </CardContent>
    </Card>
  );
}
