'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { cars as seedCars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

export default function DatabaseSeeder() {
  const [isLoading, setIsLoading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    toast({
      title: 'Sembrando la base de datos...',
      description: 'Este proceso puede tardar unos momentos.',
    });

    try {
      const carsCollection = collection(firestore, 'cars');
      
      // Check if collections are already seeded to prevent duplicates
      const carsSnapshot = await getDocs(carsCollection);
      if (!carsSnapshot.empty) {
        toast({
          variant: 'destructive',
          title: 'Base de datos ya sembrada',
          description: 'La colección de autos ya contiene datos. Se omitió el sembrado para evitar duplicados.',
        });
        setIsLoading(false);
        return;
      }

      const batch = writeBatch(firestore);

      const uniqueBrands = [...new Set(seedCars.map(car => car.brand))];
      const uniqueColors = [...new Set(seedCars.map(car => car.color))];
      const uniqueTransmissions = [...new Set(seedCars.map(car => car.transmission))];

      uniqueBrands.forEach(name => {
        const brandRef = doc(collection(firestore, 'brands'));
        batch.set(brandRef, { name });
      });

      uniqueColors.forEach(name => {
        const colorRef = doc(collection(firestore, 'colors'));
        batch.set(colorRef, { name });
      });
      
      uniqueTransmissions.forEach(name => {
        const transmissionRef = doc(collection(firestore, 'transmissions'));
        batch.set(transmissionRef, { name });
      });

      seedCars.forEach(car => {
        const carRef = doc(firestore, 'cars', car.id);
        batch.set(carRef, car);
      });

      await batch.commit();

      toast({
        title: '¡Base de datos sembrada!',
        description: `Se agregaron ${seedCars.length} autos, ${uniqueBrands.length} marcas, ${uniqueColors.length} colores y ${uniqueTransmissions.length} transmisiones.`,
      });
    } catch (error) {
      console.error('Error al sembrar la base de datos:', error);
      toast({
        variant: 'destructive',
        title: 'Error al sembrar',
        description: 'Ocurrió un error. Revisa la consola para más detalles.',
      });
    } finally {
      setIsLoading(false);
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
            <Button onClick={handleSeed} disabled={isLoading}>
            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Poblar con Datos de Ejemplo
            </Button>
        </CardContent>
    </Card>
  );
}
