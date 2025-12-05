
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/core/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Car as CarIcon, GitCompareArrows } from 'lucide-react';
import { traducciones } from '@/lib/translations';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onToggleCompare: (carId: string) => void;
}

export default function CarCard({ car, isSelected, onToggleCompare }: CarCardProps) {
  const tipoAuto = car.tipo as keyof (typeof traducciones.tipo);

  // Stop propagation on the button to prevent the Link from firing
  const handleCompareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleCompare(car.id);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl group">
        <Link href={`/car/${car.id}`} passHref legacyBehavior>
            <a className="flex-grow flex flex-col">
                <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-t-lg">
                    {car.imagenUrl ? (
                    <Image
                        src={car.imagenUrl}
                        alt={`${car.marca} ${car.modelo}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <CarIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                    )}
                </AspectRatio>
                
                <CardContent className="p-4 flex-grow flex flex-col">
                    <div>
                        <h3 className="text-lg font-bold truncate">{car.marca} {car.modelo}</h3>
                        <p className="text-sm text-muted-foreground">{traducciones.tipo[tipoAuto] || car.tipo} • {car.anio}</p>
                    </div>
                </CardContent>
            </a>
        </Link>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <p className="text-xl font-bold">${car.precio.toLocaleString('es-MX')}</p>
            <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={handleCompareClick}>
                <GitCompareArrows className="mr-2 h-4 w-4" />
                {isSelected ? 'Agregado' : 'Comparar'}
            </Button>
        </CardFooter>
    </Card>
  );
}

    