'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import { GitCompareArrows, CheckCircle, Car as CarIcon } from 'lucide-react';
import { translations } from '@/lib/translations';

interface CarCardMobileProps {
  car: Car;
  isSelected: boolean;
  onToggleCompare: (carId: string) => void;
}

export default function CarCardMobile({ car, isSelected, onToggleCompare }: CarCardMobileProps) {
  const carType = car.type as keyof (typeof translations.type);

  return (
    <div className="overflow-hidden bg-card border-b">
      <div className="p-4">
        <Link href={`/car/${car.id}`} className="block">
          <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
             <div className="aspect-[4/3] relative rounded-md overflow-hidden">
                {car.imageUrl ? (
                    <Image src={car.imageUrl} alt={car.model} fill className="object-cover"/>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <CarIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-base font-semibold leading-tight line-clamp-2">
                {car.brand} {car.model}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {car.year} - {translations.type[carType] || car.type}
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {`$${car.price.toLocaleString('es-MX')}`}
              </p>
            </div>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pt-0">
        <Button asChild size="sm">
          <Link href={`/car/${car.id}`}>Ver Detalles</Link>
        </Button>
        <Button variant={isSelected ? 'secondary' : 'outline'} size="sm" onClick={() => onToggleCompare(car.id)}>
          {isSelected ? (
            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
          ) : (
            <GitCompareArrows className="mr-2 h-4 w-4" />
          )}
          {isSelected ? 'Seleccionado' : 'Comparar'}
        </Button>
      </div>
    </div>
  );
}
