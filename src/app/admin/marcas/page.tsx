'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaMarcas from '@/features/admin/components/TablaMarcas';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function EsqueletoTablaMarcas() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="border rounded-lg">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function PaginaAdminMarcas() {
  const firestore = useFirestore();

  const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'brands'), [firestore]);
  const { data: marcas, isLoading: cargandoMarcas } = useCollection(coleccionMarcas);

  if (cargandoMarcas) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <EsqueletoTablaMarcas />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TablaMarcas marcas={marcas ?? []} />
    </div>
  );
}
