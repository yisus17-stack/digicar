
'use client';

import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import FinancingCalculator from "@/features/financing/components/FinancingCalculator";
import { Suspense } from "react";

const EsqueletoFinanciamiento = () => (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-8 w-1/4 mb-12" />
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>
);


export default function PaginaFinanciamiento() {
    const firestore = useFirestore();
    const { data: autos, isLoading } = useCollection<Car>(useMemoFirebase(() => collection(firestore, 'autos'), [firestore]));

    return (
        <Suspense fallback={<EsqueletoFinanciamiento />}>
             <div className="container mx-auto px-4 py-8 md:py-12">
                <Breadcrumbs items={[{ label: "Financiamiento" }]} />
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                    Estrena el auto de tus sueños
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Usa nuestro asesor virtual para encontrar el plan de financiamiento perfecto para ti.
                    </p>
                </div>
                {isLoading || !autos ? <EsqueletoFinanciamiento /> : <FinancingCalculator allCars={autos} />}
            </div>
        </Suspense>
    );
}
