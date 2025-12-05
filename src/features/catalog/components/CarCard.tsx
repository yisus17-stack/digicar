
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, Gauge, Droplets, GitCompareArrows } from 'lucide-react';
import { traducciones } from '@/lib/translations';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onToggleCompare: (carId: string) => void;
}

export default function CarCard({ car, isSelected, onToggleCompare }: CarCardProps) {
  const tipoAuto = car.tipo as keyof (typeof traducciones.tipo);
  const tipoCombustible = car.tipoCombustible as keyof typeof traducciones.tipoCombustible;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <Link href={`/car/${car.id}`} className="block">
        <AspectRatio ratio={16/9} className="overflow-hidden rounded-t-lg">
            {car.imagenUrl ? (
            <Image
                src={car.imagenUrl}
                alt={`${car.marca} ${car.modelo}`}
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
      <CardContent className="p-4 flex-grow">
        <p className="text-sm text-muted-foreground">{traducciones.tipo[tipoAuto] || car.tipo} • {car.anio}</p>
        <h3 className="text-lg font-bold mt-1 mb-2">
            <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                {car.marca} {car.modelo}
            </Link>
        </h3>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                <span>{traducciones.tipoCombustible[tipoCombustible] || car.tipoCombustible}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t mt-auto">
        <p className="text-xl font-bold">${car.precio.toLocaleString('es-MX')}</p>
        <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onToggleCompare(car.id)}>
          <GitCompareArrows className="mr-2 h-4 w-4" />
          {isSelected ? 'Agregado' : 'Comparar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
