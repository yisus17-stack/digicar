'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaAutos from '@/features/admin/components/TablaAutos';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function EsqueletoTablaAutos() {
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
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaginaAdminAutos() {
  const firestore = useFirestore();

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
  const { data: autos, isLoading: cargandoAutos } = useCollection<Car>(coleccionAutos);

  const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
  const { data: marcas, isLoading: cargandoMarcas } = useCollection<Marca>(coleccionMarcas);

  const coleccionColores = useMemoFirebase(() => collection(firestore, 'colores'), [firestore]);
  const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);
  
  const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
  const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);

  if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones) {
    return <EsqueletoTablaAutos />;
  }

  return (
    <TablaAutos autos={autos ?? []} marcas={marcas ?? []} colores={colores ?? []} transmisiones={transmisiones ?? []} />
  );
}
