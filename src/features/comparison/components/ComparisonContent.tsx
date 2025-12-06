'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Car as CarIcon, PlusCircle } from 'lucide-react';

const EsqueletoComparacion = () => (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
        <Skeleton className="h-8 w-1/4" />
        <div className="text-center">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>
);

const CarSelector = ({
  selectedCar,
  allCars,
  onSelect,
  otherCarId,
}: {
  selectedCar?: Car;
  allCars: Car[];
  onSelect: (carId: string) => void;
  otherCarId?: string;
}) => {
  const availableCars = allCars.filter(c => c.id !== otherCarId);
  const displayVariant = selectedCar?.variantes?.[0];
  const imageUrl = displayVariant?.imagenUrl ?? selectedCar?.imagenUrl;
  const price = displayVariant?.precio ?? selectedCar?.precio ?? 0;

  if (selectedCar) {
    return (
      <Card className="overflow-hidden md:col-span-1 w-full">
        <div className="aspect-video relative bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${selectedCar.marca} ${selectedCar.modelo}`}
              fill
              className="object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CarIcon className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <CardHeader>
          <CardTitle>
            <Link href={`/catalogo/auto/${selectedCar.id}`} className="hover:underline">
              {selectedCar.marca} {selectedCar.modelo}
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${price > 0 ? price.toLocaleString('es-MX') : 'N/A'}</p>
          <p className="text-sm text-muted-foreground">{selectedCar.anio}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full min-h-[300px] flex flex-col items-center justify-center border-dashed p-4">
      <PlusCircle className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4 text-center">Añadir auto a la comparación</p>
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full max-w-xs">
          <SelectValue placeholder="Seleccionar un auto" />
        </SelectTrigger>
        <SelectContent>
          {availableCars.map(car => {
            const variant = car.variantes?.[0];
            const imageUrl = variant?.imagenUrl ?? car.imagenUrl;
            return (
              <SelectItem key={car.id} value={car.id}>
                <div className="flex items-center gap-3">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={car.modelo}
                      width={40}
                      height={40}
                      className="rounded-md object-contain h-10 w-10"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                      <CarIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <span>{car.marca} {car.modelo}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </Card>
  );
};


export default function ComparisonContent() {
  const firestore = useFirestore();
  const [car1, setCar1] = useState<Car | undefined>(undefined);
  const [car2, setCar2] = useState<Car | undefined>(undefined);

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
  const { data: todosLosAutos, isLoading } = useCollection<Car>(coleccionAutos);

  useEffect(() => {
    if (todosLosAutos) {
      const storedIds = JSON.parse(sessionStorage.getItem('comparisonIds') || '[]');
      if (storedIds.length > 0) {
        setCar1(todosLosAutos.find(c => c.id === storedIds[0]));
        if (storedIds.length > 1) {
          setCar2(todosLosAutos.find(c => c.id === storedIds[1]));
        }
      }
    }
  }, [todosLosAutos]);

  if (isLoading || !todosLosAutos) {
    return <EsqueletoComparacion />;
  }

  const handleSelectCar1 = (carId: string) => {
    setCar1(todosLosAutos.find(c => c.id === carId));
  };

  const handleSelectCar2 = (carId: string) => {
    setCar2(todosLosAutos.find(c => c.id === carId));
  };
  
  const features = [
    { label: "Precio", key: 'precio' },
    { label: "Año", key: 'anio' },
    { label: "Tipo", key: 'tipo' },
    { label: "Combustible", key: 'tipoCombustible' },
    { label: "Transmisión", key: 'transmision' },
    { label: "Cilindros", key: 'cilindrosMotor' },
    { label: "Pasajeros", key: 'pasajeros' },
    { label: "Color", key: 'color' },
  ];

  const formatValue = (key: string, car?: Car) => {
    if (!car) return '-';
    if (key === 'precio') {
        const price = car.variantes?.[0]?.precio ?? car.precio ?? 0;
        return price > 0 ? `$${price.toLocaleString('es-MX')}` : '-';
    }
    if (key === 'color') {
        return car.variantes?.[0]?.color ?? car.color ?? '-';
    }
    const value = car[key as keyof Car] as string | number;
    return value || '-';
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Comparar' }]} />
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Comparación de Modelos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Analiza las diferencias clave entre tus opciones seleccionadas.
            </p>
        </div>
        
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <CarSelector selectedCar={car1} allCars={todosLosAutos} onSelect={handleSelectCar1} otherCarId={car2?.id} />
                <CarSelector selectedCar={car2} allCars={todosLosAutos} onSelect={handleSelectCar2} otherCarId={car1?.id} />
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
                                <div className="text-center col-span-1 font-medium">{formatValue(feature.key, car1)}</div>
                                <div className="text-center col-span-1 font-medium">{formatValue(feature.key, car2)}</div>
                            </div>
                            <Separator className="mt-4"/>
                        </div>
                    ))}
                    <div>
                        <div className="grid grid-cols-3 items-start gap-4">
                            <div className="font-semibold text-left text-muted-foreground pt-1 col-span-1">Características</div>
                            <div className="col-span-1 px-4 text-left">
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {car1?.caracteristicas?.map(f => <li key={`${car1.id}-${f}`}>{f}</li>) ?? (car1 && <li>-</li>)}
                                </ul>
                            </div>
                            <div className="col-span-1 px-4 text-left">
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    {car2?.caracteristicas?.map(f => <li key={`${car2.id}-${f}`}>{f}</li>) ?? (car2 && <li>-</li>)}
                                </ul>
                            </div>
                        </div>
                        <Separator className="mt-4"/>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
