'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Car } from '@/core/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Car as CarIcon } from 'lucide-react';
import LeadCaptureForm from '@/features/leads/components/LeadCaptureForm';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { traducciones } from '@/lib/traducciones';

interface PaginaComparacionProps {
  autos: ([Car] | [Car, Car]) & Car[];
  todosLosAutos: Car[];
}

export default function PaginaComparacion({ autos, todosLosAutos }: PaginaComparacionProps) {
  const router = useRouter();
  const [auto1, auto2] = autos;

  const handleSelectCar = (position: 'car1' | 'car2', carId: string) => {
    const currentIds = autos.map(c => c.id);
    let newIds: string[];

    if (position === 'car1') {
        newIds = [carId, currentIds[1]].filter(Boolean);
    } else {
        newIds = [currentIds[0], carId].filter(Boolean);
    }
    router.push(`/comparacion?ids=${newIds.join(',')}`);
  };

  const features = [
    { label: "Precio", key: 'precio' },
    { label: "Año", key: 'anio' },
    { label: "Tipo", key: 'tipo' },
    { label: "Combustible", key: 'tipoCombustible' },
    { label: "Transmisión", key: 'transmision' },
    { label: "Motor", key: 'motor' },
    { label: "Cilindros", key: 'cilindrosMotor' },
    { label: "Pasajeros", key: 'pasajeros' },
    { label: "Color", key: 'color' },
  ];

  const formatValue = (key: string, car?: Car) => {
    if (!car) return '-';
    const value = car[key as keyof Car] as string | number;
    
    switch (key) {
      case 'precio': return `$${Number(value).toLocaleString('es-MX')}`;
      case 'tipo': 
      case 'tipoCombustible': 
      case 'transmision': 
      case 'color':
        const translationKey = key as keyof typeof traducciones;
        if (translationKey in traducciones) {
            const valueKey = value as keyof typeof traducciones[typeof translationKey];
            if (valueKey in traducciones[translationKey]) {
                return traducciones[translationKey][valueKey];
            }
        }
        return value;
      default: return value;
    }
  }
  
  const CarSelector = ({ selectedCar, onSelect, position, otherCarId }: { selectedCar?: Car, onSelect: (pos: 'car1' | 'car2', carId: string) => void, position: 'car1' | 'car2', otherCarId?: string }) => {
    const availableCars = todosLosAutos.filter(c => c.id !== otherCarId);
    
    if (selectedCar) {
      return (
        <Card className="overflow-hidden md:col-span-1 w-full">
            <div className="aspect-video relative">
                {selectedCar.imagenUrl ? (
                    <Image src={selectedCar.imagenUrl} alt={`${selectedCar.marca} ${selectedCar.modelo}`} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <CarIcon className="w-12 h-12 text-muted-foreground" />
                    </div>
                )}
            </div>
            <CardHeader>
                <CardTitle>{selectedCar.marca} {selectedCar.modelo}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{formatValue('precio', selectedCar)}</p>
                <p className="text-sm text-muted-foreground">{selectedCar.anio}</p>
            </CardContent>
        </Card>
      )
    }

    return (
        <Card className="w-full h-full min-h-[300px] flex flex-col items-center justify-center border-dashed p-4">
            <PlusCircle className="h-10 w-10 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground mb-4 text-center">Añadir auto a la comparación</p>
            <Select onValueChange={(carId) => onSelect(position, carId)}>
                <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Seleccionar un auto" />
                </SelectTrigger>
                <SelectContent>
                    {availableCars.map(car => (
                        <SelectItem key={car.id} value={car.id}>
                            {car.marca} {car.modelo}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="link" asChild className="mt-2">
                <Link href="/catalogo">O buscar en catálogo</Link>
            </Button>
        </Card>
    );
  };


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <CarSelector selectedCar={auto1} onSelect={handleSelectCar} position="car1" otherCarId={auto2?.id} />
        <CarSelector selectedCar={auto2} onSelect={handleSelectCar} position="car2" otherCarId={auto1?.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Especificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map(feature => (
            <div key={feature.key}>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="font-semibold text-left text-muted-foreground col-span-1">{feature.label}</div>
                <div className="text-center col-span-1">{formatValue(feature.key, auto1)}</div>
                <div className="text-center col-span-1">{formatValue(feature.key, auto2)}</div>
              </div>
              <Separator className="mt-4"/>
            </div>
          ))}
          <div>
            <div className="grid grid-cols-3 items-start gap-4">
                <div className="font-semibold text-left text-muted-foreground pt-1 col-span-1">Características</div>
                <div className="text-center col-span-1">
                    <ul className="list-disc list-inside text-left space-y-1 text-sm">
                        {auto1?.caracteristicas.map(f => <li key={`${auto1.id}-${f}`}>{f}</li>)}
                    </ul>
                </div>
                <div className="text-center col-span-1">
                    <ul className="list-disc list-inside text-left space-y-1 text-sm">
                        {auto2?.caracteristicas.map(f => <li key={`${auto2.id}-${f}`}>{f}</li>)}
                    </ul>
                </div>
            </div>
             <Separator className="mt-4"/>
          </div>
        </CardContent>
      </Card>
      
      {(auto1 || auto2) && (
        <Card>
          <CardHeader>
              <CardTitle>¿Interesado?</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground mb-4">Obtén una cotización personalizada o programa una prueba de manejo para uno de estos modelos.</p>
              <LeadCaptureForm interestedCars={[auto1, auto2].filter(Boolean).map(c => `${c?.marca} ${c?.modelo}`).join(', ')} />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
