
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Car as CarIcon } from 'lucide-react';
import { traducciones } from '@/lib/translations';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  if (!car) {
    return null;
  }
  const tipoAuto = car.tipo as keyof (typeof traducciones.tipo);

  return (
    <Link href={`/car/${car.id}`} className="group flex h-full flex-col">
        <div className="mb-4">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
            {car.imagenUrl ? (
              <Image
                src={car.imagenUrl}
                alt={`${car.marca} ${car.modelo}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <CarIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        </div>

        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-foreground">{car.marca} {car.modelo}</h3>
          <p className="text-sm text-muted-foreground">{traducciones.tipo[tipoAuto] || car.tipo} • {car.anio}</p>
          <p className="mt-2 text-base font-semibold text-foreground">${car.precio.toLocaleString('es-MX')}</p>
        </div>
    </Link>
  );
}
