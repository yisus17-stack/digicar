
import ComparisonPage from "@/components/comparison/ComparisonPage";
import { cars } from "@/lib/data";
import { Car } from "@/lib/types";
import { GitCompareArrows } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function Compare({ 
  searchParams,
}: { 
  searchParams: { ids?: string },
}) {
  const ids = searchParams.ids?.split(',').filter(Boolean) || [];
  const carsToCompare = cars.filter(car => ids.includes(car.id)).slice(0, 2);

  if (carsToCompare.length < 1) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <GitCompareArrows className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Selecciona Autos para Comparar</h1>
        <p className="mt-2 text-lg text-muted-foreground">Por favor, selecciona al menos un auto del catálogo para ver la comparación.</p>
        <Button asChild className="mt-6">
          <Link href="/catalog">Ir al Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Comparación de Modelos
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Así es como se comparan los vehículos que seleccionaste. Deja que nuestra IA te ayude a decidir.
            </p>
        </div>
        <ComparisonPage 
          cars={carsToCompare as [Car] | [Car, Car]} 
          allCars={cars}
        />
    </div>
  );
}
