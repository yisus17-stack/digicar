'use client';

import Image from 'next/image';
import type { Auto } from '@/lib/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import { GitCompareArrows, CheckCircle, Car as IconoAuto } from 'lucide-react';
import { traducciones } from '@/lib/traducciones';

interface TarjetaAutoMovilProps {
  auto: Auto;
  estaSeleccionado: boolean;
  alAlternarComparacion: (autoId: string) => void;
}

export default function TarjetaAutoMovil({ auto, estaSeleccionado, alAlternarComparacion }: TarjetaAutoMovilProps) {
  const tipoAuto = auto.type as keyof (typeof traducciones.type);

  return (
    <div className="overflow-hidden bg-card border-b">
      <div className="p-4">
        <Link href={`/car/${auto.id}`} className="block">
          <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
             <div className="aspect-[4/3] relative rounded-md overflow-hidden">
                {auto.imageUrl ? (
                    <Image src={auto.imageUrl} alt={auto.model} fill className="object-cover"/>
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <IconoAuto className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-base font-semibold leading-tight line-clamp-2">
                {auto.brand} {auto.model}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {auto.year} - {traducciones.type[tipoAuto] || auto.type}
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {`$${auto.price.toLocaleString('es-MX')}`}
              </p>
            </div>
          </div>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 pt-0">
        <Button asChild size="sm">
          <Link href={`/car/${auto.id}`}>Ver Detalles</Link>
        </Button>
        <Button variant={estaSeleccionado ? 'secondary' : 'outline'} size="sm" onClick={() => alAlternarComparacion(auto.id)}>
          {estaSeleccionado ? (
            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
          ) : (
            <GitCompareArrows className="mr-2 h-4 w-4" />
          )}
          {estaSeleccionado ? 'Seleccionado' : 'Comparar'}
        </Button>
      </div>
    </div>
  );
}
