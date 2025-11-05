
'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import { Button } from '../ui/button';
import Link from 'next/link';
import { GitCompareArrows } from 'lucide-react';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 rounded-none">
      <div className="relative h-52 overflow-hidden bg-gray-50">
        {placeholder && (
          <Image
            src={placeholder.imageUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            className={cn(
              'object-cover transition-transform duration-300 group-hover:scale-105',
              !placeholder.imageUrl.includes('unsplash') && 'object-contain'
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={placeholder.imageHint}
            priority={true}
          />
        )}
      </div>

      <CardContent className="flex flex-grow flex-col p-6">
        <h3 className="text-2xl leading-tight">{car.model}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
            {car.brand}
        </p>
        <p className="text-sm text-muted-foreground">
            {car.year} - {translations.type[car.type as keyof typeof translations.type]}
        </p>
        <p className="mt-2 text-xl text-foreground">
          ${car.price.toLocaleString()}
        </p>
        
        <div className="mt-auto grid grid-cols-2 gap-4 pt-4">
            <Button asChild>
                <Link href={`/car/${car.id}`}>
                    Ver Detalles
                </Link>
            </Button>
            <Button variant="outline">
                <GitCompareArrows className="mr-2 h-4 w-4" />
                Comparar
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
