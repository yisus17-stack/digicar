'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { GitCommitHorizontal, Gauge, Users } from 'lucide-react';
import { Button } from '../ui/button';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg duration-300 ease-in-out group">
        <div className="overflow-hidden">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={`${car.brand} ${car.model}`}
              width={600}
              height={400}
              className="object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      <CardContent className="p-4 flex-grow flex flex-col">
        <div className="text-sm uppercase text-muted-foreground">{car.brand}</div>
        <p className="text-lg font-bold mb-2">{car.model}</p>
        <div className="flex items-center justify-between text-primary font-bold text-lg mb-4">
            <span>{car.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="w-4 h-4" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            <span>{car.horsepower} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>5</span>
          </div>
        </div>
        <Button className="w-full mt-4">Ver detalles</Button>
      </CardContent>
    </Card>
  );
}
