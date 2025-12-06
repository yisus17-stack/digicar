'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Car as CarIcon, GitCompareArrows } from 'lucide-react';
import { traducciones } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface CarCardProps {
  car: Car;
  onToggleCompare: (carId: string) => void;
  isComparing: boolean;
}

export default function CarCard({ car, onToggleCompare, isComparing }: CarCardProps) {
  if (!car) {
    return null;
  }
  const tipoAuto = car.tipo as keyof (typeof traducciones.tipo);
  
  const displayVariant = car.variantes && car.variantes.length > 0 ? car.variantes[0] : null;
  const imageUrl = displayVariant?.imagenUrl ?? car.imagenUrl;
  const price = displayVariant?.precio ?? car.precio ?? 0;

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleCompare(car.id);
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link
        href={`/catalogo/auto/${car.id}`}
        className="flex h-full flex-col"
      >
        <div className="relative h-56 w-full bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${car.marca} ${car.modelo}`}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <CarIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
           <Button 
            variant="secondary" 
            size="sm" 
            className={cn(
              "absolute top-2 right-2 z-10 h-8",
              isComparing && "ring-2 ring-primary"
            )}
            onClick={handleCompareClick}
          >
             <GitCompareArrows className={cn("mr-2 h-4 w-4", isComparing && "text-primary")} />
             {isComparing ? 'Comparando' : 'Comparar'}
           </Button>
        </div>

        <div className="flex flex-grow flex-col px-4 pt-4 pb-4">
          <div className="flex-grow">
            <h3 className="text-lg font-semibold leading-tight">{car.marca} {car.modelo}</h3>
            <p className="text-sm text-muted-foreground">
              {traducciones.tipo[tipoAuto] || car.tipo} • {car.anio}
            </p>
          </div>
          <p className="mt-4 pt-2 text-xl font-bold border-t">
            ${price.toLocaleString('es-MX')}
          </p>
        </div>
      </Link>
    </Card>
  );
}
