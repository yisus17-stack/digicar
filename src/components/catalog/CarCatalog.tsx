'use client';

import { Car } from '@/lib/types';
import CarCard from './CarCard';

interface CarCatalogProps {
  cars: Car[];
}

// A simplified version of CarCatalog for the home page.
export default function CarCatalog({ cars }: CarCatalogProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {cars.map(car => (
        <CarCard
          key={car.id}
          car={car}
        />
      ))}
    </div>
  );
}
