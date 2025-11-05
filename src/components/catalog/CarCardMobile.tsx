
'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { translations } from '@/lib/translations';
import { Button } from '../ui/button';
import Link from 'next/link';
import { GitCompareArrows } from 'lucide-react';

interface CarCardMobileProps {
  car: Car;
}

export default function CarCardMobile({ car }: CarCardMobileProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <div className="overflow-hidden bg-card border-b">
      <div className="p-4">
        <Link href={`/car/${car.id}`} className="block">
          <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
            <div className="relative">
              {placeholder && (
                <Image
                  src={placeholder.imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  width={placeholder.width}
                  height={placeholder.height}
                  className={cn(
                    'object-cover rounded-none bg-gray-50',
                  )}
                  sizes="120px"
                  data-ai-hint={placeholder.imageHint}
                />
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-base font-semibold leading-tight line-clamp-2">
                {car.brand} {car.model}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {car.year} - {translations.type[car.type as keyof typeof translations.type]}
              </p>
              <p className="mt-2 text-lg text-foreground">
                {`$${car.price.toLocaleString('es-MX')}`}
              </p>
            </div>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pt-2">
        <Button asChild size="sm">
          <Link href={`/car/${car.id}`}>Ver Detalles</Link>
        </Button>
        <Button variant="outline" size="sm">
          <GitCompareArrows className="mr-2 h-4 w-4" />
          Comparar
        </Button>
      </div>
    </div>
  );
}
