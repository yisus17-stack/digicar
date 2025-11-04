'use client';

import { useState, useMemo, useTransition } from 'react';
import { useDebounce } from 'use-debounce';
import { cars } from '@/lib/data';
import type { Car } from '@/lib/types';
import CarFilters from './CarFilters';
import CarCard from './CarCard';
import { Input } from '../ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import AiSummary from './AiSummary';
import { summarizeCatalogFilters } from '@/ai/flows/summarize-catalog-filters';

const ITEMS_PER_PAGE = 6;

export default function CarCatalogPage() {
  const [filters, setFilters] = useState({
    brand: 'all',
    fuelType: 'all',
    transmission: 'all',
    priceRange: [0, 200000],
    year: 'all',
    type: 'all',
    engineCylinders: 'all',
    color: 'all',
    passengers: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);

  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, startAiTransition] = useTransition();

  const filteredCars = useMemo(() => {
    let filtered = cars.filter(car => {
      const { brand, fuelType, transmission, priceRange, year, type, engineCylinders, color, passengers } = filters;
      if (brand !== 'all' && car.brand !== brand) return false;
      if (fuelType !== 'all' && car.fuelType !== fuelType) return false;
      if (transmission !== 'all' && car.transmission !== transmission) return false;
      if (car.price < priceRange[0] || car.price > priceRange[1]) return false;
      if (year !== 'all' && car.year !== parseInt(year)) return false;
      if (type !== 'all' && car.type !== type) return false;
      if (engineCylinders !== 'all' && car.engineCylinders !== parseInt(engineCylinders)) return false;
      if (color !== 'all' && car.color !== color) return false;
      if (passengers !== 'all' && car.passengers !== parseInt(passengers)) return false;
      return true;
    });

    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(car => 
        car.brand.toLowerCase().includes(lowercasedTerm) ||
        car.model.toLowerCase().includes(lowercasedTerm) ||
        car.features.some(f => f.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    return filtered;
  }, [filters, debouncedSearchTerm]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };
  
  const handleResetFilters = () => {
    setFilters({
      brand: 'all',
      fuelType: 'all',
      transmission: 'all',
      priceRange: [0, 200000],
      year: 'all',
      type: 'all',
      engineCylinders: 'all',
      color: 'all',
      passengers: 'all',
    });
    setSearchTerm('');
    setAiSummary('');
    setCurrentPage(1);
  };

  const handleSearchWithAI = () => {
    if (!searchTerm) return;
    
    startAiTransition(async () => {
      setAiSummary('');
      const result = await summarizeCatalogFilters({
        filters: JSON.stringify(filters),
        userDescription: searchTerm,
        carList: JSON.stringify(filteredCars.map(c => ({id: c.id, brand: c.brand, model: c.model, features: c.features, price: c.price})))
      });
      setAiSummary(result.recommendation);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Inicio</span> &gt; Catálogo
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <CarFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            cars={cars}
          />
        </aside>

        <main className="lg:col-span-3 flex flex-col">
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="text"
                placeholder="Describe tu auto ideal y usa la IA..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-24 h-12 text-base"
                />
                <Button 
                  onClick={handleSearchWithAI}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={isAiLoading}
                >
                  {isAiLoading ? 'Analizando...' : 'Buscar con IA'}
                </Button>
            </div>
            
            { (isAiLoading || aiSummary) && <AiSummary summary={aiSummary} /> }
            
            <div className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedCars.map(car => (
                  <CarCard key={car.id} car={car} />
                  ))}
              </div>

              {filteredCars.length === 0 && (
                  <div className="text-center py-16">
                      <X className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h2 className="mt-4 text-xl font-semibold">No se encontraron resultados</h2>
                      <p className="mt-2 text-muted-foreground">Intenta ajustar tus filtros o búsqueda.</p>
                  </div>
              )}
            </div>

            <div className='pt-8'>
              {totalPages > 1 && (
                  <Pagination className="mt-4">
                  <PaginationContent>
                      <PaginationItem>
                      <PaginationPrevious 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                          <PaginationLink 
                              href="#"
                              isActive={currentPage === i + 1}
                              onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                          >
                          {i + 1}
                          </PaginationLink>
                      </PaginationItem>
                      ))}
                      <PaginationItem>
                      <PaginationNext 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                      </PaginationItem>
                  </PaginationContent>
                  </Pagination>
              )}
            </div>
        </main>
      </div>
    </div>
  );
}
