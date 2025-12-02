'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/lib/types';
import { Car as CarIcon, Gauge, Droplets, GitCompareArrows } from 'lucide-react';
import { Button } from '../ui/button';
import { translations } from '@/lib/translations';

interface CarCardMobileProps {
  car: Car;
  isSelected: boolean;
  onToggleCompare: (carId: string) => void;
}

export default function CarCardMobile({ car, isSelected, onToggleCompare }: CarCardMobileProps) {
    const tipoCombustible = car.fuelType as keyof typeof translations.fuelType;

    return (
        <div className="border-b p-4 flex gap-4 last:border-b-0">
             <div className="w-2/5 flex-shrink-0">
                 <Link href={`/car/${car.id}`} className="block relative aspect-video">
                    {car.imageUrl ? (
                        <Image
                            src={car.imageUrl}
                            alt={`${car.brand} ${car.model}`}
                            fill
                            className="object-cover rounded-md"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                            <CarIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                    )}
                </Link>
             </div>
             <div className="w-3/5 flex flex-col justify-between">
                <div>
                    <p className="text-xs text-muted-foreground">{car.year}</p>
                    <h3 className="font-bold leading-tight">
                         <Link href={`/car/${car.id}`} className="hover:text-primary transition-colors">
                            {car.brand} {car.model}
                        </Link>
                    </h3>
                    <p className="text-lg font-bold text-primary mt-1">${car.price.toLocaleString('es-MX')}</p>
                </div>
                 <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                    <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" />
                        <span>{car.mileage.toLocaleString('es-MX')} {car.fuelType === 'Electric' ? 'km' : 'KPL'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        <span>{translations.fuelType[tipoCombustible] || car.fuelType}</span>
                    </div>
                </div>
                <div className='mt-2'>
                    <Button variant={isSelected ? 'default' : 'outline'} size="sm" onClick={() => onToggleCompare(car.id)} className="w-full">
                        <GitCompareArrows className="mr-2 h-4 w-4" />
                        {isSelected ? 'Agregado' : 'Comparar'}
                    </Button>
                </div>
             </div>
        </div>
    );
}