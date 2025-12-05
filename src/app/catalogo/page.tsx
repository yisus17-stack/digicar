
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { useDebounce } from 'use-debounce';
import CarFilters from '@/features/catalog/components/CarFilters';
import CarCard from '@/features/catalog/components/CarCard';
import { SlidersHorizontal, GitCompareArrows, Car as CarIcon, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const ITEMS_PER_PAGE = 9;
const MAX_PRICE = 2000000;

export type SortOrder = 'relevance' | 'price-asc' | 'price-desc' | 'year-desc';

const CatalogSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: 'Catálogo' }]} />
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            <aside className="hidden lg:block lg:w-1/4 space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </aside>
            <main className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                        <Skeleton key={i} className="h-96 w-full" />
                    ))}
                </div>
            </main>
        </div>
    </div>
);

export function ComparisonBar({ selectedIds, onRemove, onClear, onCompare, allCars }: { selectedIds: string[], onRemove: (id: string) => void, onClear: () => void, onCompare: () => void, allCars: Car[] }) {
  const selectedCars = selectedIds.map(id => allCars.find(car => car.id === id)).filter((c): c is Car => !!c);

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50"
        >
          <div className="bg-card border rounded-lg shadow-2xl p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="font-semibold text-sm sm:text-base whitespace-nowrap">Comparar ({selectedIds.length}/2)</h3>
                <div className="flex items-center gap-2">
                  {selectedCars.map(car => (
                    <div key={car.id} className="relative flex items-center gap-2 bg-muted p-1.5 rounded-md text-xs">
                       <Image src={car.imagenUrl} alt={car.modelo} width={24} height={24} className="rounded-sm object-cover" />
                       <span className="font-medium truncate max-w-[100px]">{car.marca} {car.modelo}</span>
                       <button onClick={() => onRemove(car.id)} className="ml-1 text-muted-foreground hover:text-foreground">
                         <X size={14} />
                       </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                 <Button variant="outline" size="sm" onClick={onClear} className="flex-grow sm:flex-grow-0">
                    <Trash2 className="mr-2 h-4 w-4" /> Limpiar
                 </Button>
                 <Button onClick={onCompare} disabled={selectedIds.length < 1} className="flex-grow sm:flex-grow-0">
                    <GitCompareArrows className="mr-2 h-4 w-4" /> Comparar
                 </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


function CatalogPageContent() {
    const firestore = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
    const { data: datosTodosLosAutos, isLoading: isLoadingCars } = useCollection<Car>(coleccionAutos);

    const initialSearchTerm = searchParams.get('search') || '';

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
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
    const [showFilters, setShowFilters] = useState(true);
    const isMobile = useIsMobile();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [comparisonIds, setComparisonIds] = useState<string[]>([]);

    useEffect(() => {
        setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    useEffect(() => {
        const storedIds = sessionStorage.getItem('comparisonIds');
        if (storedIds) {
            setComparisonIds(JSON.parse(storedIds));
        }
    }, []);

    const handleToggleCompare = (carId: string) => {
        setComparisonIds(prevIds => {
            let newIds;
            if (prevIds.includes(carId)) {
                newIds = prevIds.filter(id => id !== carId);
            } else if (prevIds.length < 2) {
                newIds = [...prevIds, carId];
            } else {
                return prevIds;
            }
            sessionStorage.setItem('comparisonIds', JSON.stringify(newIds));
            return newIds;
        });
    };

    const handleClearCompare = () => {
        setComparisonIds([]);
        sessionStorage.removeItem('comparisonIds');
    };

    const handleCompare = () => {
        router.push('/comparacion');
    };

    const filteredCars = useMemo(() => {
        if (!datosTodosLosAutos) return [];
        
        let filtered = datosTodosLosAutos.filter(car => {
            if (!car) return false;
            const { brand, fuelType, transmission, price, year, type, engineCylinders, color, passengers } = filters;
            if (brand !== 'all' && car.marca !== brand) return false;
            if (fuelType !== 'all' && car.tipoCombustible !== fuelType) return false;
            if (transmission !== 'all' && car.transmision !== transmission) return false;
            if (car.precio > price) return false;
            if (year !== 'all' && car.anio !== parseInt(year)) return false;
            if (type !== 'all' && car.tipo !== type) return false;
            if (engineCylinders !== 'all' && car.cilindrosMotor !== parseInt(engineCylinders)) return false;
            if (color !== 'all' && car.color !== color) return false;
            if (passengers !== 'all' && car.pasajeros !== parseInt(passengers)) return false;
            return true;
        });

        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(car =>
                car.marca.toLowerCase().includes(lowercasedTerm) ||
                car.modelo.toLowerCase().includes(lowercasedTerm) ||
                car.tipo.toLowerCase().includes(lowercasedTerm) ||
                car.caracteristicas.some(f => f.toLowerCase().includes(lowercasedTerm))
            );
        }

        if (sortOrder === 'price-asc') {
            filtered.sort((a, b) => a.precio - b.precio);
        } else if (sortOrder === 'price-desc') {
            filtered.sort((a, b) => b.precio - a.precio);
        } else if (sortOrder === 'year-desc') {
            filtered.sort((a, b) => b.anio - a.anio);
        }

        return filtered;
    }, [filters, debouncedSearchTerm, sortOrder, datosTodosLosAutos]);

    const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
    const paginatedCars = filteredCars.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setFilters({ brand: 'all', fuelType: 'all', transmission: 'all', price: MAX_PRICE, year: 'all', type: 'all', engineCylinders: 'all', color: 'all', passengers: 'all' });
        setSearchTerm('');
        setCurrentPage(1);
        setSortOrder('relevance');
    };
    
    if (isLoadingCars || !datosTodosLosAutos) {
        return <CatalogSkeleton />;
    }
    
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
          cars={datosTodosLosAutos}
          maxPrice={MAX_PRICE}
          sortComponent={isMobile ? sortOptions : undefined}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      );

    return (
        <div className="container mx-auto px-4 py-8 pb-32">
            <Breadcrumbs items={[{ label: 'Catálogo' }]} />
            <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start flex-grow">
                {showFilters && (
                    <aside className="hidden lg:block lg:w-1/4 sticky top-24">
                        {filterComponent}
                    </aside>
                )}
                
                <main className="flex-1">
                    <div className='flex justify-between items-center mb-6'>
                        <p className="text-sm text-muted-foreground">{filteredCars.length} resultados</p>
                        <div className='flex items-center gap-4'>
                            <div className='lg:hidden'>
                                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="sm"><SlidersHorizontal className='mr-2 h-4 w-4' />Filtrar</Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="flex flex-col w-full">
                                        <SheetHeader><SheetTitle>Filtrar y Ordenar</SheetTitle></SheetHeader>
                                        <ScrollArea className="flex-1 -mx-6 px-6"><div className='pr-6'>{filterComponent}</div></ScrollArea>
                                        <SheetFooter className="pt-4 border-t"><Button onClick={() => setIsSheetOpen(false)} className='w-full'>Aplicar</Button></SheetFooter>
                                    </SheetContent>
                                </Sheet>
                            </div>
                            <div className='hidden lg:flex items-center gap-4'>
                                <Button variant="ghost" size="sm" onClick={() => setShowFilters(prev => !prev)}>
                                    <SlidersHorizontal className='mr-2 h-4 w-4' />{showFilters ? "Ocultar filtros" : "Mostrar filtros"}
                                </Button>
                                {sortOptions}
                            </div>
                        </div>
                    </div>

                    {paginatedCars.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                            {paginatedCars.map(car => (
                                <CarCard key={`car-${car.id}`} car={car} isSelected={comparisonIds.includes(car.id)} onToggleCompare={handleToggleCompare} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <X className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">No se encontraron resultados</h2>
                            <p className="mt-2 text-muted-foreground">Intenta ajustar tus filtros o búsqueda.</p>
                        </div>
                    )}
                    
                    <div className='pt-8 mt-auto'>
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(Math.max(1, currentPage - 1)); }} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} /></PaginationItem>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <PaginationItem key={i}><PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }}>{i + 1}</PaginationLink></PaginationItem>
                                    ))}
                                    <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(Math.min(totalPages, currentPage + 1)); }} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} /></PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                </main>
            </div>
             <ComparisonBar 
                selectedIds={comparisonIds}
                onRemove={handleToggleCompare}
                onClear={handleClearCompare}
                onCompare={handleCompare}
                allCars={datosTodosLosAutos}
            />
        </div>
    );
}

export default function Catalog() {
    return (
        <Suspense fallback={<CatalogSkeleton />}>
            <CatalogPageContent />
        </Suspense>
    )
}

    