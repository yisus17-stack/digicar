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
      <div className="h-56 w-full flex items-center justify-center p-6 bg-muted">
        {car.imagenUrl ? (
          <Image
            src={car.imagenUrl}
            alt={`${car.marca} ${car.modelo}`}
            width={300}
            height={300}
            className="h-40 w-auto object-contain"
          />
        ) : (
          <CarIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* TEXTO */}
      <div className="flex flex-col px-4 py-4 flex-grow">
        <h3 className="text-base font-semibold">{car.marca} {car.modelo}</h3>
        <p className="text-sm text-muted-foreground">
          {traducciones.tipo[tipoAuto] || car.tipo} • {car.anio}
        </p>
        <p className="mt-auto pt-2 text-base font-bold">
          ${car.precio.toLocaleString('es-MX')}
        </p>
      </div>
    </Link>
  );
}