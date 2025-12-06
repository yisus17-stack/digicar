'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Car as CarIcon, PlusCircle, Save, Loader2, GitCompareArrows, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


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
  onClear,
}: {
  selectedCar?: Car;
  allCars: Car[];
  onSelect: (carId: string) => void;
  otherCarId?: string;
  onClear: () => void;
}) => {
  const availableCars = allCars.filter(c => c.id !== otherCarId);
  const displayVariant = selectedCar?.variantes?.[0];
  const imageUrl = displayVariant?.imagenUrl ?? selectedCar?.imagenUrl;
  
  if (selectedCar) {
    return (
      <div className="flex flex-col items-center justify-start text-center">
        <Link href={`/catalogo/auto/${selectedCar.id}`} className="block">
            <div className="relative w-64 h-48 mb-4">
            {imageUrl ? (
                <Image
                src={imageUrl}
                alt={`${selectedCar.marca} ${selectedCar.modelo}`}
                fill
                className="object-contain"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
                <CarIcon className="w-16 h-16 text-muted-foreground" />
                </div>
            )}
            </div>
            <p className="text-lg font-semibold hover:underline">
                {selectedCar.marca} {selectedCar.modelo}
            </p>
        </Link>
         <Button variant="link" onClick={onClear} className="text-sm mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Cambiar
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full h-full min-h-[280px] flex flex-col items-center justify-center border-dashed p-4">
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
                    <div className="relative h-10 w-10 flex-shrink-0">
                      <Image
                        src={imageUrl}
                        alt={car.modelo}
                        fill
                        className="rounded-md object-contain"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
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
  const { user, loading: loadingUser } = useUser();
  const router = useRouter();
  const [car1, setCar1] = useState<Car | undefined>(undefined);
  const [car2, setCar2] = useState<Car | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
  const { data: todosLosAutos, isLoading } = useCollection<Car>(coleccionAutos);

 useEffect(() => {
    if (todosLosAutos && todosLosAutos.length > 0) {
      try {
        const storedIds = JSON.parse(sessionStorage.getItem('comparisonIds') || '[]');
        if (Array.isArray(storedIds) && storedIds.length > 0) {
          if (storedIds[0]) setCar1(todosLosAutos.find(c => c.id === storedIds[0]));
          if (storedIds[1]) setCar2(todosLosAutos.find(c => c.id === storedIds[1]));
        }
      } catch (e) {
        console.error("Error reading comparison IDs from sessionStorage", e);
        sessionStorage.removeItem('comparisonIds');
      }
    }
  }, [todosLosAutos]);


  useEffect(() => {
    // This effect ensures that if the user logs out while on the page, the state is cleared.
    if (!loadingUser && !user) {
      setCar1(undefined);
      setCar2(undefined);
      // sessionStorage is cleared in handleSignOut, but this is a fallback.
    }
  }, [user, loadingUser]);

  const updateSessionStorage = (newCar1Id?: string, newCar2Id?: string) => {
    sessionStorage.setItem('comparisonIds', JSON.stringify([newCar1Id, newCar2Id]));
  }

  const handleSelectCar1 = (carId: string) => {
    const selected = todosLosAutos?.find(c => c.id === carId);
    setCar1(selected);
    updateSessionStorage(carId, car2?.id);
  };

  const handleSelectCar2 = (carId: string) => {
    const selected = todosLosAutos?.find(c => c.id === carId);
    setCar2(selected);
    updateSessionStorage(car1?.id, carId);
  };

  const clearCar1 = () => {
    setCar1(undefined);
    updateSessionStorage(undefined, car2?.id);
  }
  
  const clearCar2 = () => {
    setCar2(undefined);
    updateSessionStorage(car1?.id, undefined);
  }


  const handleSaveComparison = async () => {
    if (!user) {
      router.push('/login?redirect=/comparacion');
      return;
    }
    if (!car1 || !car2) return;

    setIsSaving(true);
    
    const comparisonData = {
        userId: user.uid,
        carId1: car1.id,
        carId2: car2.id,
        createdAt: serverTimestamp(),
    };

    try {
        const comparacionesRef = collection(firestore, 'comparaciones');
        await addDoc(comparacionesRef, comparisonData);

        await Swal.fire({
            title: '¡Comparación Guardada!',
            text: 'Puedes ver tus comparaciones en tu perfil.',
            icon: 'success',
            confirmButtonColor: '#595c97',
        });
        
        // Reset state after saving
        setCar1(undefined);
        setCar2(undefined);
        sessionStorage.removeItem('comparisonIds');

    } catch (error) {
       console.error("Error guardando la comparación: ", error);
        
        const contextualError = new FirestorePermissionError({
            operation: 'create',
            path: 'comparaciones',
            requestResourceData: comparisonData,
        });
        errorEmitter.emit('permission-error', contextualError);

        Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar la comparación. Verifica los permisos o inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#595c97',
        });
    } finally {
        setIsSaving(false);
    }
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
  
  if (isLoading || !todosLosAutos || loadingUser) {
    return <EsqueletoComparacion />;
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
            <div className="grid grid-cols-[1fr_auto_1fr] items-start justify-center gap-8">
                <CarSelector 
                    selectedCar={car1} 
                    allCars={todosLosAutos} 
                    onSelect={handleSelectCar1} 
                    otherCarId={car2?.id} 
                    onClear={clearCar1}
                />
                <div className="flex items-center h-full pt-16">
                    <GitCompareArrows className="h-8 w-8 text-muted-foreground" />
                </div>
                <CarSelector 
                    selectedCar={car2} 
                    allCars={todosLosAutos} 
                    onSelect={handleSelectCar2} 
                    otherCarId={car1?.id}
                    onClear={clearCar2}
                />
            </div>

            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Especificaciones</CardTitle>
                     <Button onClick={handleSaveComparison} disabled={!car1 || !car2 || isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Comparación
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {features.map(feature => (
                        <div key={feature.key}>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <div className="text-left font-semibold text-muted-foreground col-span-1">{feature.label}</div>
                                <div className="text-left col-span-1 font-medium px-4">{formatValue(feature.key, car1)}</div>
                                <div className="text-left col-span-1 font-medium px-4">{formatValue(feature.key, car2)}</div>
                            </div>
                            <Separator className="mt-4"/>
                        </div>
                    ))}
                    <div>
                        <div className="grid grid-cols-3 items-start gap-4">
                            <div className="text-left font-semibold text-muted-foreground pt-1 col-span-1">Características</div>
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
