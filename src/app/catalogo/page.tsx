
'use client';

import PaginaCatalogoAutos from "@/features/catalog/components/CarCatalogPage";
import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Car } from '@/core/types';
import { Suspense } from 'react';

const EsqueletoCatalogo = () => (
    <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            {/* Esqueleto de Filtros */}
            <aside className="hidden lg:block lg:w-1/4 space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
            </aside>
            {/* Esqueleto de Contenido */}
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

function ContenidoCatalogo() {
    const firestore = useFirestore();
    const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
    const { data: autos, isLoading } = useCollection<Car>(coleccionAutos);

    if (isLoading) {
        return <EsqueletoCatalogo />;
    }

    return (
        <PaginaCatalogoAutos datosTodosLosAutos={autos ?? []} />
    );
}

export default function Catalogo() {
    return (
        <Suspense fallback={<EsqueletoCatalogo />}>
            <ContenidoCatalogo />
        </Suspense>
    );
}
