'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaMarcas from '@/features/admin/components/TablaMarcas';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function EsqueletoTablaMarcas() {
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

export default function PaginaAdminMarcas() {
  const firestore = useFirestore();

  const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
  const { data: marcas, isLoading: cargandoMarcas } = useCollection(coleccionMarcas);

  if (cargandoMarcas) {
    return <EsqueletoTablaMarcas />;
  }

  return (
    <TablaMarcas marcas={marcas ?? []} />
  );
}
