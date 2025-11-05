'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import { Button } from '../ui/button';
import Link from 'next/link';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
      <div className="absolute top-0 left-0 z-10 -mt-4 -ml-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg">
        <div className="text-center">
            <span className="block text-lg font-bold leading-tight">
            ${(car.price / 1000).toFixed(0)}K
            </span>
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden bg-gray-50">
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
        <h3 className="text-2xl font-bold leading-tight">{car.model}</h3>
        <div className="my-2 h-1 w-10 bg-primary"></div>
        <p className="text-sm text-muted-foreground">
            {car.brand} - {translations.type[car.type as keyof typeof translations.type]}
        </p>
        
        <div className="mt-auto flex w-full pt-4">
            <Button asChild className="w-full">
                <Link href={`/car/${car.id}`}>
                    Ver Detalles
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
