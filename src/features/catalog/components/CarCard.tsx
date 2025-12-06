'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Car as CarIcon } from 'lucide-react';
import { traducciones } from '@/lib/translations';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  if (!car) {
    return null;
  }
  const tipoAuto = car.tipo as keyof (typeof traducciones.tipo);

  return (
    <Link
      href={`/car/${car.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-card transition-all duration-300 hover:shadow-md"
    >
      {/* IMAGEN */}
      <div className="h-60 w-full bg-muted rounded-xl flex items-center justify-center p-6">
        {car.imagenUrl ? (
          <Image
            src={car.imagenUrl}
            alt={`${car.marca} ${car.modelo}`}
            className="max-h-40 max-w-full object-contain"
            width={280}
            height={280}
          />
        ) : (
          <CarIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* TEXTO */}
      <div className="flex flex-grow flex-col px-4 pb-4">
        <div className="flex-grow">
          <h3 className="min-h-[48px] text-base font-semibold">
            {car.marca} {car.modelo}
          </h3>
          <p className="text-sm text-muted-foreground">
            {traducciones.tipo[tipoAuto] || car.tipo} • {car.anio}
          </p>
        </div>
        <p className="mt-2 pt-2 text-base font-bold">
          ${car.precio.toLocaleString('es-MX')}
        </p>
      </div>
    </Link>
  );
}