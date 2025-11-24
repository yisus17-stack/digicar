'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaTiposCombustible from '@/components/admin/TablaTiposCombustible';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function EsqueletoTablaTiposCombustible() {
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

export default function PaginaAdminCombustibles() {
  const firestore = useFirestore();

  const coleccionCombustibles = useMemoFirebase(() => collection(firestore, 'fuelTypes'), [firestore]);
  const { data: combustibles, isLoading: cargandoCombustibles } = useCollection(coleccionCombustibles);

  if (cargandoCombustibles) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <EsqueletoTablaTiposCombustible />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TablaTiposCombustible combustibles={combustibles ?? []} />
    </div>
  );
}
