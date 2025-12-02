'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaTransmisiones from '@/features/admin/components/TablaTransmisiones';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transmision } from '@/core/types';

function EsqueletoTablaTransmisiones() {
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

export default function PaginaAdminTransmisiones() {
  const firestore = useFirestore();

  const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmissions'), [firestore]);
  const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);

  if (cargandoTransmisiones) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <EsqueletoTablaTransmisiones />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TablaTransmisiones transmisiones={transmisiones ?? []} />
    </div>
  );
}
