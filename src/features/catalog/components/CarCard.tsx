'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Gauge, Droplets, GitCompareArrows } from 'lucide-react';
import { translations } from '@/lib/translations';

interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onToggleCompare: (carId: string) => void;
}

export default function CarCard({ car, isSelected, onToggleCompare }: CarCardProps) {
  const tipoAuto = car.type as keyof (typeof translations.type);
  const tipoCombustible = car.fuelType as keyof typeof translations.fuelType;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={`/car/${car.id}`}>
          <AspectRatio ratio={16 / 9}>
            {car.imageUrl ? (
              <Image
                src={car.imageUrl}
                alt={`${car.brand} ${car.model}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <CarIcon className="w-12 h-12 text-muted-foreground" />
                </div>
            )}
          </AspectRatio>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{translations.type[tipoAuto] || car.type} • {car.year}</p>
        <CardTitle className="text-lg font-bold mt-1 mb-2">
            <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                {car.brand} {car.model}
            </Link>
        </CardTitle>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span>{car.mileage.toLocaleString('es-MX')} {car.fuelType === 'Electric' ? 'km' : 'KPL'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                <span>{translations.fuelType[tipoCombustible] || car.fuelType}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <p className="text-xl font-bold">${car.price.toLocaleString('es-MX')}</p>
        <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onToggleCompare(car.id)}>
          <GitCompareArrows className="mr-2 h-4 w-4" />
          {isSelected ? 'Agregado' : 'Comparar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
