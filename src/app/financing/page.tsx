'use client';

import FinancingSimulatorPage from "@/components/financing/FinancingSimulatorPage";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


const FinancingSkeleton = () => (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-8 w-1/4 mb-12" />
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-3 space-y-8">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    </div>
);

export default function FinancingPage() {
    const firestore = useFirestore();
    const carsCollection = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
    const { data: cars, isLoading } = useCollection<Car>(carsCollection);

    if (isLoading || !cars) {
        return <FinancingSkeleton />;
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs items={[{ label: "Financiamiento" }]} />
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            Simulador de Pagos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Calcula y visualiza las opciones de financiamiento para el auto de tus sueños.
            </p>
        </div>
        <FinancingSimulatorPage cars={cars} />
        </div>
    );
}
