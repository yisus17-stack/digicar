'use client';

import Image from 'next/image';
import type { Auto } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { GitCompareArrows, CheckCircle, Car as IconoAuto } from 'lucide-react';
import { traducciones } from '@/lib/traducciones';

interface TarjetaAutoProps {
  auto: Auto;
  estaSeleccionado: boolean;
  alAlternarComparacion: (autoId: string) => void;
}

export default function TarjetaAuto({ auto, estaSeleccionado, alAlternarComparacion }: TarjetaAutoProps) {
  const tipoAuto = auto.type as keyof (typeof traducciones.type);

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 bg-card">
      <Link href={`/car/${auto.id}`}>
        <div className="aspect-video relative overflow-hidden">
          {auto.imageUrl ? (
            <Image
              src={auto.imageUrl}
              alt={`${auto.brand} ${auto.model}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <IconoAuto className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      <CardContent className="flex flex-grow flex-col p-6">
        <h3 className="text-xl font-bold leading-tight">{auto.brand} {auto.model}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
            {auto.year} - {traducciones.type[tipoAuto] || auto.type}
        </p>
        <p className="mt-4 text-2xl font-bold text-primary">
          {`$${auto.price.toLocaleString('es-MX')}`}
        </p>
        
        <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
            <Button asChild>
                <Link href={`/car/${auto.id}`}>
                    Ver Detalles
                </Link>
            </Button>
            <Button variant={estaSeleccionado ? 'secondary' : 'outline'} onClick={() => alAlternarComparacion(auto.id)}>
                {estaSeleccionado ? (
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                ) : (
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                )}
                {estaSeleccionado ? 'Seleccionado' : 'Comparar'}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
