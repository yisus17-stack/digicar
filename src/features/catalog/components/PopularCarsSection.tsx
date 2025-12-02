'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Car } from '@/core/types';
import CarCard from './CarCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ComparisonBar } from './CarCatalogPage';

export default function PopularCarsSection() {
    const firestore = useFirestore();
    const router = useRouter();
    const [comparisonIds, setComparisonIds] = useState<string[]>([]);

    const consultaAutosPopulares = useMemoFirebase(() => query(collection(firestore, 'cars'), limit(3)), [firestore]);
    const { data: autosPopulares, isLoading: cargandoAutosPopulares } = useCollection<Car>(consultaAutosPopulares);

    const { data: todosLosAutos } = useCollection<Car>(useMemoFirebase(() => collection(firestore, 'cars'), [firestore]));

    const handleToggleCompare = (carId: string) => {
        setComparisonIds(prevIds => {
            if (prevIds.includes(carId)) {
                return prevIds.filter(id => id !== carId);
            }
            if (prevIds.length < 2) {
                return [...prevIds, carId];
            }
            return prevIds;
        });
    };

    const handleCompare = () => {
        router.push(`/compare?ids=${comparisonIds.join(',')}`);
    };

    if (cargandoAutosPopulares) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <Skeleton className="h-10 w-2/3 mx-auto" />
                    <Skeleton className="h-6 w-1/3 mx-auto mt-2" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!autosPopulares || autosPopulares.length === 0) {
        return null;
    }

    return (
        <>
            <div id="popular" className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
                    <p className="mt-2 text-muted-foreground">Una selección de nuestros vehículos más deseados.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {autosPopulares.map(car => (
                        <CarCard 
                            key={`popular-${car.id}`} 
                            car={car}
                            isSelected={comparisonIds.includes(car.id)}
                            onToggleCompare={handleToggleCompare}
                        />
                    ))}
                </div>
            </div>
            <ComparisonBar 
                selectedIds={comparisonIds}
                onRemove={handleToggleCompare}
                onClear={() => setComparisonIds([])}
                onCompare={handleCompare}
                allCars={todosLosAutos ?? []}
            />
        </>
    );
}
