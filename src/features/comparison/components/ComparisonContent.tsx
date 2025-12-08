

'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import type { Car, CarVariant, Comparison, UserProfile } from '@/core/types';
import EsqueletoComparacion from '@/features/comparison/components/EsqueletoComparacion';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Car as CarIcon, PlusCircle, Save, Loader2, GitCompareArrows, RefreshCw, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { cn } from '@/lib/utils';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useDebounce } from 'use-debounce';


const CarSelector = ({
  selectedCar,
  selectedVariant,
  allCars,
  onCarSelect,
  onVariantSelect,
  otherCarId,
  onClear,
}: {
  selectedCar?: Car;
  selectedVariant?: CarVariant;
  allCars: Car[];
  onCarSelect: (carId: string) => void;
  onVariantSelect: (variantId: string) => void;
  otherCarId?: string;
  onClear: () => void;
}) => {
  const availableCars = allCars.filter(c => c.id !== otherCarId);
  const imageUrl = selectedVariant?.imagenUrl;
  
  if (selectedCar) {
    return (
      <div className="flex flex-col items-center justify-start text-center space-y-4">
        <Link href={`/catalogo/auto/${selectedCar.id}`} className="block w-full max-w-xs">
             <AspectRatio ratio={16/10} className="rounded-lg">
                {imageUrl ? (
                    <Image
                    src={imageUrl}
                    alt={`${selectedCar.marca} ${selectedCar.modelo}`}
                    fill
                    className="object-contain"
                    draggable="false"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                    <CarIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                )}
            </AspectRatio>
            <p className="text-lg font-semibold hover:underline mt-4">
                {selectedCar.marca} {selectedCar.modelo}
            </p>
        </Link>
        {selectedCar.variantes && selectedCar.variantes.length > 1 && (
             <Select onValueChange={onVariantSelect} value={selectedVariant?.id}>
                <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Seleccionar un color" />
                </SelectTrigger>
                <SelectContent>
                    {selectedCar.variantes.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.color}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
        <Button variant="link" onClick={onClear} className="text-sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Cambiar Auto
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full h-full min-h-[280px] flex flex-col items-center justify-center border-dashed p-4">
      <PlusCircle className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-muted-foreground mb-4 text-center">Añadir auto a la comparación</p>
      <Select onValueChange={onCarSelect}>
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
                        draggable="false"
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
  
  const [carId1, setCarId1] = useState<string | undefined>();
  const [variantId1, setVariantId1] = useState<string | undefined>();
  const [carId2, setCarId2] = useState<string | undefined>();
  const [variantId2, setVariantId2] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
  const { data: todosLosAutos, isLoading: loadingCars } = useCollection<Car>(coleccionAutos);

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'usuarios', user.uid) : null, [user, firestore]);
  const { data: userProfile, isLoading: loadingProfile } = useDoc<UserProfile>(userProfileRef);

  const car1 = useMemo(() => todosLosAutos?.find(c => c.id === carId1), [carId1, todosLosAutos]);
  const car2 = useMemo(() => todosLosAutos?.find(c => c.id === carId2), [carId2, todosLosAutos]);
  
  const variant1 = useMemo(() => car1?.variantes?.find(v => v.id === variantId1), [variantId1, car1]);
  const variant2 = useMemo(() => car2?.variantes?.find(v => v.id === variantId2), [variantId2, car2]);

  const [debouncedCarId1] = useDebounce(carId1, 500);
  const [debouncedVariantId1] = useDebounce(variantId1, 500);
  const [debouncedCarId2] = useDebounce(carId2, 500);
  const [debouncedVariantId2] = useDebounce(variantId2, 500);
  
  useEffect(() => {
    if (!loadingUser && !user) {
      router.replace('/login');
    }
  }, [user, loadingUser, router]);

  // Effect to load initial state from Firestore on first load
  useEffect(() => {
    if (isInitialLoad && userProfile && todosLosAutos) {
      const [comp1, comp2] = userProfile.currentComparison || [];

      if (comp1) {
        const [cId1, vId1] = comp1.split(':');
        if (cId1 && todosLosAutos.some(c => c.id === cId1)) {
          setCarId1(cId1);
          setVariantId1(vId1);
        }
      }
      if (comp2) {
        const [cId2, vId2] = comp2.split(':');
        if (cId2 && todosLosAutos.some(c => c.id === cId2)) {
          setCarId2(cId2);
          setVariantId2(vId2);
        }
      }
      setIsInitialLoad(false);
    }
  }, [userProfile, todosLosAutos, isInitialLoad]);

  // Effect to persist selection to Firestore
  useEffect(() => {
    if (isInitialLoad || !user || !userProfileRef || loadingProfile) {
      return;
    }
    
    const idsToSave = [
      debouncedCarId1 && debouncedVariantId1 ? `${debouncedCarId1}:${debouncedVariantId1}` : undefined,
      debouncedCarId2 && debouncedVariantId2 ? `${debouncedCarId2}:${debouncedVariantId2}` : undefined,
    ].filter((id): id is string => !!id);

    const currentIds = (userProfile?.currentComparison || []).filter(Boolean);

    if (currentIds.length !== idsToSave.length || currentIds.some((id, i) => id !== idsToSave[i])) {
      setDoc(userProfileRef, { currentComparison: idsToSave }, { merge: true });
    }
  }, [debouncedCarId1, debouncedVariantId1, debouncedCarId2, debouncedVariantId2, user, userProfileRef, loadingProfile, isInitialLoad, userProfile]);

  const resetComparison = async () => {
    setCarId1(undefined);
    setVariantId1(undefined);
    setCarId2(undefined);
    setVariantId2(undefined);
    if (userProfileRef) {
        await setDoc(userProfileRef, { currentComparison: [] }, { merge: true });
    }
  };
  
  const handleSelectCar1 = (id: string) => {
    setCarId1(id);
    const selected = todosLosAutos?.find(c => c.id === id);
    setVariantId1(selected?.variantes?.[0]?.id);
  };

  const handleSelectCar2 = (id: string) => {
    setCarId2(id);
    const selected = todosLosAutos?.find(c => c.id === id);
    setVariantId2(selected?.variantes?.[0]?.id);
  };

  const clearCar1 = () => {
    setCarId1(undefined);
    setVariantId1(undefined);
  }
  
  const clearCar2 = () => {
    setCarId2(undefined);
    setVariantId2(undefined);
  }

  const handleSaveComparison = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!car1 || !car2 || !variant1 || !variant2) return;

    setIsSaving(true);
    
    const comparisonData = {
        usuarioId: user.uid,
        autoId1: car1.id,
        varianteId1: variant1.id,
        autoId2: car2.id,
        varianteId2: variant2.id,
        fechaCreacion: serverTimestamp(),
    };

    try {
        await addDoc(collection(firestore, 'comparaciones'), comparisonData);
        
        await Swal.fire({
            title: '¡Comparación Guardada!',
            text: 'Puedes ver tus comparaciones en tu perfil.',
            icon: 'success',
            confirmButtonColor: '#595c97',
        });
        await resetComparison();
        
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
  ];

  const formatValue = (key: string, car?: Car, variant?: CarVariant) => {
    if (!car) return '-';
    if (key === 'precio') {
        return variant?.precio ? `$${variant.precio.toLocaleString('es-MX')}` : '-';
    }
    const value = car[key as keyof Car] as string | number;
    return value || '-';
  }

  const isLoading = loadingUser || loadingCars || loadingProfile || isInitialLoad;

  if (isLoading) {
      return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
  }

  if (!user || !todosLosAutos) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Comparar' }]} />
        <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Comparación de Modelos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Analiza las diferencias clave entre tus opciones seleccionadas.
            </p>
        </div>
        
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start justify-center gap-y-2 md:gap-y-4 md:gap-x-2">
                <CarSelector 
                    selectedCar={car1}
                    selectedVariant={variant1} 
                    allCars={todosLosAutos} 
                    onCarSelect={handleSelectCar1} 
                    onVariantSelect={setVariantId1}
                    otherCarId={car2?.id} 
                    onClear={clearCar1}
                />
                <div className="flex items-center justify-center h-full my-2 md:my-0 md:pt-16">
                    <GitCompareArrows className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0" />
                </div>
                <CarSelector 
                    selectedCar={car2} 
                    selectedVariant={variant2}
                    allCars={todosLosAutos} 
                    onCarSelect={handleSelectCar2} 
                    onVariantSelect={setVariantId2}
                    otherCarId={car1?.id}
                    onClear={clearCar2}
                />
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <CardTitle>Especificaciones</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <Button onClick={handleSaveComparison} disabled={!car1 || !car2 || isSaving} className="w-full">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Comparación
                        </Button>
                         <Button variant="outline" onClick={resetComparison} disabled={!car1 && !car2} className="w-full">
                            <X className="mr-2 h-4 w-4" />
                            Limpiar Comparación
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="hidden md:grid md:grid-cols-3 items-center gap-4 py-2 font-bold text-lg">
                        <div className="text-muted-foreground">Característica</div>
                        <div>{car1 ? `${car1.marca} ${car1.modelo}` : 'Auto 1'}</div>
                        <div>{car2 ? `${car2.marca} ${car2.modelo}` : 'Auto 2'}</div>
                    </div>
                    
                    <div className="md:hidden">
                        <div className="grid grid-cols-2 gap-4 text-center font-bold text-lg mb-4">
                            <div>{car1 ? `${car1.marca} ${car1.modelo}` : 'Auto 1'}</div>
                            <div>{car2 ? `${car2.marca} ${car2.modelo}` : 'Auto 2'}</div>
                        </div>
                        <Separator />
                    </div>


                    {features.map((feature, index) => (
                        <div key={feature.key}>
                            <div className="grid grid-cols-2 md:grid-cols-3 items-center gap-x-4 md:gap-4 py-4">
                                <div className="col-span-2 md:col-span-1 font-semibold text-muted-foreground">{feature.label}</div>
                                
                                <div className="md:hidden col-span-2"><Separator className="mt-2"/></div>

                                <div className="mt-2 md:mt-0 text-left font-medium">
                                    {formatValue(feature.key, car1, variant1)}
                                </div>

                                <div className="mt-2 md:mt-0 text-left font-medium">
                                    {formatValue(feature.key, car2, variant2)}
                                </div>
                            </div>
                            {index < features.length - 1 && <Separator />}
                        </div>
                    ))}
                     <Separator />
                     <div className="grid grid-cols-2 md:grid-cols-3 items-start gap-x-4 md:gap-4 py-4">
                         <div className="col-span-2 md:col-span-1 font-semibold text-muted-foreground pt-1">Características</div>
                         <div className="mt-2 md:mt-0 text-left">
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {car1?.caracteristicas?.map(f => <li key={`${car1.id}-${f}`}>{f}</li>) ?? (car1 && <li>-</li>)}
                            </ul>
                        </div>
                        <div className="mt-2 md:mt-0 text-left">
                             <ul className="list-disc list-inside space-y-1 text-sm">
                                {car2?.caracteristicas?.map(f => <li key={`${car2.id}-${f}`}>{f}</li>) ?? (car2 && <li>-</li>)}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    