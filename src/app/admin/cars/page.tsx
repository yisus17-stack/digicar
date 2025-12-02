'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TablaAutos from '@/components/admin/TablaAutos';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Car, Marca, Color, Transmision } from '@/lib/types';
import SembradorBaseDatos from '@/components/admin/SembradorBaseDatos';

function EsqueletoTablaAutos() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="border rounded-lg">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function PaginaAdminAutos() {
  const firestore = useFirestore();

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const { data: autos, isLoading: cargandoAutos } = useCollection<Car>(coleccionAutos);

  const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'brands'), [firestore]);
  const { data: marcas, isLoading: cargandoMarcas } = useCollection<Marca>(coleccionMarcas);

  const coleccionColores = useMemoFirebase(() => collection(firestore, 'colors'), [firestore]);
  const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);
  
  const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmissions'), [firestore]);
  const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);

  if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EsqueletoTablaAutos />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TablaAutos autos={autos ?? []} marcas={marcas ?? []} colores={colores ?? []} transmisiones={transmisiones ?? []} />
      <SembradorBaseDatos />
    </div>
  );
}
