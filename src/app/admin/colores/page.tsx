'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaColores from '@/features/admin/components/TablaColores';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Color } from '@/core/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function EsqueletoTablaColores() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <div className="border rounded-lg">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaginaAdminColores() {
  const firestore = useFirestore();

  const coleccionColores = useMemoFirebase(() => collection(firestore, 'colores'), [firestore]);
  const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);

  if (cargandoColores) {
    return <EsqueletoTablaColores />;
  }

  return (
    <TablaColores colors={colores ?? []} />
  );
}
