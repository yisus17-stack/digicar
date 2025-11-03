'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from '@/lib/types';
import CarCard from './CarCard';
import { Button } from '@/components/ui/button';
import { GitCompareArrows } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CarCatalogProps {
  cars: Car[];
}

export default function CarCatalog({ cars }: CarCatalogProps) {
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const handleToggleSelect = (id: string) => {
    setSelectedCars(prev => {
      if (prev.includes(id)) {
        return prev.filter(carId => carId !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      toast({
        title: 'Límite de Selección Alcanzado',
        description: 'Solo puedes comparar hasta 2 autos a la vez.',
        variant: 'destructive',
      });
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedCars.length === 2) {
      router.push(`/compare?ids=${selectedCars.join(',')}`);
    } else {
        toast({
            title: 'Selecciona Dos Autos',
            description: 'Por favor, selecciona exactamente dos autos para comparar.',
        });
    }
  };
  
  const selectionDisabled = selectedCars.length >= 2;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cars.map(car => (
          <CarCard
            key={car.id}
            car={car}
            isSelected={selectedCars.includes(car.id)}
            onToggleSelect={handleToggleSelect}
            selectionDisabled={selectionDisabled}
          />
        ))}
      </div>
      {selectedCars.length > 0 && (
        <div className="sticky bottom-4 inset-x-0 flex justify-center mt-8">
            <div className="bg-card/90 backdrop-blur-lg p-3 rounded-lg shadow-2xl border flex items-center gap-4">
                <p className="text-sm font-medium">{selectedCars.length} / 2 autos seleccionados</p>
                <Button onClick={handleCompare} disabled={selectedCars.length !== 2}>
                    <GitCompareArrows className="mr-2 h-4 w-4" />
                    Comparar
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
