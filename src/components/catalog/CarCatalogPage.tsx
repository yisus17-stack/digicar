
'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { cars } from '@/lib/data';
import type { Car } from '@/lib/types';
import CarFilters from './CarFilters';
import CarCard from './CarCard';
import { X, SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import AiSummary from './AiSummary';
import { summarizeCatalogFilters } from '@/ai/flows/summarize-catalog-filters';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '../ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '../ui/scroll-area';

const ITEMS_PER_PAGE = 6;
const MAX_PRICE = 2000000;

export type SortOrder = 'relevance' | 'price-asc' | 'price-desc' | 'year-desc';

export default function CarCatalogPage() {
  const [filters, setFilters] = useState({
    brand: 'all',
    fuelType: 'all',
    transmission: 'all',
    price: MAX_PRICE,
    year: 'all',
    type: 'all',
    engineCylinders: 'all',
    color: 'all',
    passengers: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
  const [showFilters, setShowFilters] = useState(true);
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [aiSummary, setAiSummary] = useState('');
  const [isAiLoading, startAiTransition] = useTransition();

  const filteredCars = useMemo(() => {
    let filtered = cars.filter(car => {
      const { brand, fuelType, transmission, price, year, type, engineCylinders, color, passengers } = filters;
      if (brand !== 'all' && car.brand !== brand) return false;
      if (fuelType !== 'all' && car.fuelType !== fuelType) return false;
      if (transmission !== 'all' && car.transmission !== transmission) return false;
      if (car.price > price) return false;
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

    if (sortOrder === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'year-desc') {
      filtered.sort((a, b) => b.year - a.year);
    }
    
    return filtered;
  }, [filters, debouncedSearchTerm, sortOrder]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    if (!isMobile) {
      setCurrentPage(1);
    }
  };
  
  const handleResetFilters = () => {
    setFilters({
      brand: 'all',
      fuelType: 'all',
      transmission: 'all',
      price: MAX_PRICE,
      year: 'all',
      type: 'all',
      engineCylinders: 'all',
      color: 'all',
      passengers: 'all',
    });
    setSearchTerm('');
    setAiSummary('');
    setCurrentPage(1);
    setSortOrder('relevance');
  };
  
  const handleApplyMobileFilters = () => {
    setCurrentPage(1);
    setIsSheetOpen(false);
  }

  const handleSearchWithAI = () => {
    startAiTransition(async () => {
      setAiSummary('');
      const result = await summarizeCatalogFilters({
        filters: JSON.stringify(filters),
        userDescription: searchTerm,
        carList: JSON.stringify(filteredCars.map(c => ({id: c.id, brand: c.brand, model: c.model, features: c.features, price: c.price})))
      });
      setAiSummary(result.recommendation);
      if (isMobile) {
        setIsSheetOpen(false);
      }
    });
  };

  const sortOptions = (
    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
      <SelectTrigger className="w-full md:w-[220px] focus-visible:ring-0 focus-visible:ring-offset-0">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="relevance">Relevancia</SelectItem>
        <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
        <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
        <SelectItem value="year-desc">Año: Más reciente primero</SelectItem>
      </SelectContent>
    </Select>
  );

  const filterComponent = (
    <CarFilters 
      filters={filters}
      onFilterChange={handleFilterChange}
      onReset={handleResetFilters}
      onSearchWithAI={handleSearchWithAI}
      isLoading={isAiLoading}
      cars={cars}
      maxPrice={MAX_PRICE}
      sortComponent={isMobile ? sortOptions : undefined}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
    />
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="text-primary font-medium hover:underline">Inicio</Link> &gt; Catálogo
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start flex-grow">
        {hasMounted && !isMobile && showFilters && (
            <aside className='lg:w-1/4'>
                {filterComponent}
            </aside>
        )}

        <main className={cn('flex flex-1 flex-col', !showFilters ? 'lg:w-full' : 'lg:w-3/4')}>
            <div className='flex justify-between items-center mb-6'>
              <p className="text-sm text-muted-foreground">{filteredCars.length} resultados</p>
              <div className='flex items-center gap-4'>
                {isMobile ? (
                  <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <SlidersHorizontal className='mr-2 h-4 w-4' />
                        Filtrar y Ordenar
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="flex flex-col w-full">
                      <SheetHeader>
                        <SheetTitle>Filtrar y Ordenar</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="flex-1">
                        <div className='pr-6'>
                          {filterComponent}
                        </div>
                      </ScrollArea>
                      <SheetFooter className="pt-4 border-t">
                        <Button onClick={handleApplyMobileFilters} className='w-full'>Aplicar</Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                ) : (
                  hasMounted && <>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(prev => !prev)}>
                      <SlidersHorizontal className='mr-2 h-4 w-4' />
                      {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                    </Button>
                    {sortOptions}
                  </>
                )}
              </div>
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

            <div className='pt-8 mt-auto'>
              {totalPages > 1 && (
                  <Pagination>
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

    
