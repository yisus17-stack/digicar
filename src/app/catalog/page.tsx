'use client';

import { useState } from 'react';
import CarCatalogPage from "@/components/catalog/CarCatalogPage";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const CatalogSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            {/* Filtros Skeleton */}
            <aside className="hidden lg:block lg:w-1/4 space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </aside>
            {/* Contenido Skeleton */}
            <main className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </main>
        </div>
    </div>
);


export default function Catalog() {
    const firestore = useFirestore();
    const carsCollection = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
    const { data: cars, isLoading } = useCollection(carsCollection);

    if (isLoading) {
        return <CatalogSkeleton />;
    }

    return (
        <CarCatalogPage allCarsData={cars ?? []} />
    );
}
