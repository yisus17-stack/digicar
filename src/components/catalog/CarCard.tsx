'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import Link from 'next/link';
import { GitCompareArrows, CheckCircle } from 'lucide-react';
import { translations } from '@/lib/translations';

interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onToggleCompare: (carId: string) => void;
}

export default function CarCard({ car, isSelected, onToggleCompare }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.id);
  const carType = car.type as keyof (typeof translations.type);

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
       {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={`${car.brand} ${car.model}`}
            width={placeholder.width}
            height={placeholder.height}
            className="bg-gray-50 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={placeholder.imageHint}
            priority={true}
          />
        )}

      <CardContent className="flex flex-grow flex-col p-6">
        <h3 className="text-xl font-semibold leading-tight">{car.brand} {car.model}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
            {car.year} - {translations.type[carType] || car.type}
        </p>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {`$${car.price.toLocaleString('es-MX')}`}
        </p>
        
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4">
            <Button asChild>
                <Link href={`/car/${car.id}`}>
                    Ver Detalles
                </Link>
            </Button>
            <Button variant={isSelected ? 'secondary' : 'outline'} onClick={() => onToggleCompare(car.id)}>
                {isSelected ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                ) : (
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                )}
                {isSelected ? 'Seleccionado' : 'Comparar'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
