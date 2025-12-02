'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { cars as autosDeEjemplo } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SembradorBaseDatos() {
  const [cargando, setCargando] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const manejarSembrado = async () => {
    setCargando(true);
    toast({
      title: 'Sembrando la base de datos...',
      description: 'Este proceso puede tardar unos momentos.',
    });

    try {
      const coleccionAutos = collection(firestore, 'cars');
      
      const snapshotAutos = await getDocs(coleccionAutos);
      if (!snapshotAutos.empty) {
        toast({
          variant: 'destructive',
          title: 'Base de datos ya sembrada',
          description: 'La colección de autos ya contiene datos. Se omitió el sembrado para evitar duplicados.',
        });
        setCargando(false);
        return;
      }

      const batch = writeBatch(firestore);

      const marcasUnicas = [...new Set(autosDeEjemplo.map(auto => auto.brand))];
      const coloresUnicos = [...new Set(autosDeEjemplo.map(auto => auto.color))];
      const transmisionesUnicas = [...new Set(autosDeEjemplo.map(auto => auto.transmission))];

      marcasUnicas.forEach(name => {
        const brandRef = doc(collection(firestore, 'brands'));
        batch.set(brandRef, { name, id: brandRef.id });
      });

      coloresUnicos.forEach(name => {
        const colorRef = doc(collection(firestore, 'colors'));
        batch.set(colorRef, { name, id: colorRef.id });
      });
      
      transmisionesUnicas.forEach(name => {
        const transmissionRef = doc(collection(firestore, 'transmissions'));
        batch.set(transmissionRef, { name, id: transmissionRef.id });
      });

      autosDeEjemplo.forEach(auto => {
        const carRef = doc(firestore, 'cars', auto.id);
        batch.set(carRef, auto);
      });

      await batch.commit();

      toast({
        title: '¡Base de datos sembrada!',
        description: `Se agregaron ${autosDeEjemplo.length} autos.`,
      });
    } catch (error) {
      console.error('Error al sembrar la base de datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error al sembrar',
        description: 'Ocurrió un error. Revisa la consola para más detalles.',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle>Poblar Base de Datos</CardTitle>
            <CardDescription>
                Usa este botón para cargar los datos de ejemplo (autos, marcas, colores, etc.) en tu base de datos de Firestore. Esta acción solo se puede realizar una vez para evitar datos duplicados.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={manejarSembrado} disabled={cargando}>
            {cargando ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Poblar con Datos de Ejemplo
            </Button>
        </CardContent>
    </Card>
  );
}
