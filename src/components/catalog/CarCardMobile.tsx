
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

interface CarCardMobileProps {
  car: Car;
}

export default function CarCardMobile({ car }: CarCardMobileProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={`/car/${car.id}`} className="block">
          <div className="flex gap-4">
            <div className="relative w-1/3 flex-shrink-0 aspect-[4/3]">
                {placeholder && (
                <Image
                    src={placeholder.imageUrl}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className={cn(
                        'object-cover rounded-md',
                        !placeholder.imageUrl.includes('unsplash') && 'object-contain'
                    )}
                    sizes="33vw"
                    data-ai-hint={placeholder.imageHint}
                />
                )}
            </div>
            <div className="flex flex-1 flex-col justify-center">
                <h3 className="text-base leading-tight line-clamp-2">{car.brand} {car.model}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {car.year} - {translations.type[car.type as keyof typeof translations.type]}
                </p>
                <p className="mt-2 text-lg text-foreground">
                    ${car.price.toLocaleString()}
                </p>
            </div>
          </div>
        </Link>
      </CardContent>
      <div className="mt-auto grid grid-cols-2 gap-2 p-2 border-t">
        <Button asChild size="sm">
            <Link href={`/car/${car.id}`}>
                Ver Detalles
            </Link>
        </Button>
        <Button variant="outline" size="sm">
            <GitCompareArrows className="mr-2 h-4 w-4" />
            Comparar
        </Button>
      </div>
    </Card>
  );
}
