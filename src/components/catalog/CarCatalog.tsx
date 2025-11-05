'use client';

import { Car } from '@/lib/types';
import CarCard from './CarCard';
import CarCardMobile from './CarCardMobile';

interface CarCatalogProps {
  cars: Car[];
}

export default function CarCatalog({ cars }: CarCatalogProps) {
  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden border rounded-lg overflow-hidden">
        {cars.map(car => (
          <CarCardMobile key={`mobile-${car.id}`} car={car} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map(car => (
          <CarCard key={`desktop-${car.id}`} car={car} />
        ))}
      </div>
    </>
  );
}
