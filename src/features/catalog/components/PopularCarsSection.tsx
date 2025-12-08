
'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import type { Car } from '@/core/types';
import CarCard from './CarCard';
import { Skeleton } from '@/components/ui/skeleton';

const PopularCarsSkeleton = () => (
    <div className="container mx-auto px-4">
        <div className="text-center mb-6">
            <Skeleton className="h-10 w-2/3 mx-auto" />
            <Skeleton className="h-6 w-1/3 mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg bg-muted p-4" />
                    <div className="space-y-2 py-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export default function PopularCarsSection() {
    const firestore = useFirestore();

    const consultaAutosPopulares = useMemoFirebase(() => query(collection(firestore, 'autos'), limit(3)), [firestore]);
    const { data: autosPopulares, isLoading: cargandoAutosPopulares } = useCollection<Car>(consultaAutosPopulares);


    if (cargandoAutosPopulares) {
        return <PopularCarsSkeleton />;
    }

    if (!autosPopulares || autosPopulares.length === 0) {
        return null;
    }

    return (
        <>
            <div id="popular" className="container mx-auto px-4">
                <div className="text-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
                    <p className="mt-2 text-muted-foreground">Una selección de nuestros vehículos más deseados.</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-6">
                    {autosPopulares.map(car => (
                        <CarCard 
                            key={`popular-${car.id}`} 
                            car={car}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

    
