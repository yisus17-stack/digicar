'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaTransmisiones from '@/features/admin/components/TablaTransmisiones';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transmision } from '@/core/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function EsqueletoTablaTransmisiones() {
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

export default function PaginaAdminTransmisiones() {
  const firestore = useFirestore();

  const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
  const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);

  if (cargandoTransmisiones) {
    return <EsqueletoTablaTransmisiones />;
  }

  return (
    <TablaTransmisiones transmisiones={transmisiones ?? []} />
  );
}
