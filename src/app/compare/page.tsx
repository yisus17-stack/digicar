'use client';

import { useSearchParams } from 'next/navigation';
import PaginaComparacion from "@/features/comparison/components/ComparisonPage";
import { GitCompareArrows } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

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

function ContenidoComparacion() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const { data: todosLosAutos, isLoading } = useCollection<Car>(coleccionAutos);

  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];
  
  if (isLoading || !todosLosAutos) {
      return <EsqueletoComparacion />;
  }

  const autosAComparar = todosLosAutos.filter(auto => ids.includes(auto.id)).slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Comparar' }]} />
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Comparación de Modelos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Así es como se comparan los vehículos que seleccionaste. Deja que nuestra IA te ayude a decidir.
            </p>
        </div>
         {autosAComparar.length < 1 ? (
            <div className="text-center">
                <GitCompareArrows className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold tracking-tight">Selecciona Autos para Comparar</h2>
                <p className="mt-2 text-lg text-muted-foreground">Por favor, selecciona al menos un auto del catálogo para ver la comparación.</p>
                <Button asChild className="mt-6">
                <Link href="/catalog">Ir al Catálogo</Link>
                </Button>
            </div>
        ) : (
            <PaginaComparacion 
              autos={autosAComparar as [Car] | [Car, Car]} 
              todosLosAutos={todosLosAutos}
            />
        )}
    </div>
  );
}

export default function Comparar() {
  return (
    <Suspense fallback={<EsqueletoComparacion />}>
      <ContenidoComparacion />
    </Suspense>
  );
}
