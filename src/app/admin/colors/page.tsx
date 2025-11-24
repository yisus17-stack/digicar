'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaColores from '@/components/admin/TablaColores';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Color } from '@/lib/types';

function EsqueletoTablaColores() {
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

export default function PaginaAdminColores() {
  const firestore = useFirestore();

  const coleccionColores = useMemoFirebase(() => collection(firestore, 'colors'), [firestore]);
  const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);

  if (cargandoColores) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <EsqueletoTablaColores />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TablaColores colors={colores ?? []} />
    </div>
  );
}
