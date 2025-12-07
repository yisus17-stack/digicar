
'use client';

import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import FinancingCalculator from "@/features/financing/components/FinancingCalculator";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    const { user, loading: loadingUser } = useUser();
    const router = useRouter();
    
    const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
    const { data: autos, isLoading } = useCollection<Car>(coleccionAutos);

    useEffect(() => {
        if (!loadingUser && !user) {
            router.push('/login?redirect=/financiamiento');
        }
    }, [user, loadingUser, router]);

    if (loadingUser || isLoading) {
        return <EsqueletoFinanciamiento />;
    }

    if (!user) {
        return null;
    }

    return (
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
        <FinancingCalculator allCars={autos ?? []} />
        </div>
    );
}
