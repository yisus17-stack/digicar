
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { useDebounce } from 'use-debounce';
import CarFilters from '@/features/catalog/components/CarFilters';
import CarCard from '@/features/catalog/components/CarCard';
import { SlidersHorizontal, Car as CarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_PRICE = 2000000;

export type SortOrder = 'relevance' | 'price-asc' | 'price-desc' | 'year-desc';

const CatalogSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm mb-4">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-4 w-4 mx-1" />
        <Skeleton className="h-5 w-20" />
      </div>
        <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
            <aside className="hidden lg:block lg:w-1/4 space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </aside>
            <main className="flex-1">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-48" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-6">
                    {[...Array(9)].map((_, i) => (
                       <div key={i} className="space-y-3">
                            <Skeleton className="aspect-square w-full rounded-lg bg-muted p-4" />
                            <div className="space-y-2 py-2">
                              <Skeleton className="h-4 w-4/5" />
                              <Skeleton className="h-4 w-3/5" />
                              <Skeleton className="h-4 w-2/5" />
                              <Skeleton className="h-5 w-1/3" />
                            </div>
                       </div>
                    ))}
                </div>
            </main>
        </div>
    </div>
);


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
    const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
    const [showFilters, setShowFilters] = useState(true);
    const isMobile = useIsMobile();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        setSearchTerm(initialSearchTerm);
    }, [initialSearchTerm]);

    const filteredCars = useMemo(() => {
        if (!datosTodosLosAutos) return [];
        
        let filtered = datosTodosLosAutos.filter(car => {
            if (!car) return false;
            const { brand, fuelType, transmission, price, year, type, engineCylinders, color, passengers } = filters;
            const carPrice = car.variantes?.[0]?.precio ?? car.precio ?? 0;

            if (brand !== 'all' && car.marca !== brand) return false;
            if (fuelType !== 'all' && car.tipoCombustible !== fuelType) return false;
            if (transmission !== 'all' && car.transmision !== transmission) return false;
            if (carPrice > price) return false;
            if (year !== 'all' && car.anio !== parseInt(year)) return false;
            if (type !== 'all' && car.tipo !== type) return false;
            if (engineCylinders !== 'all' && car.cilindrosMotor !== parseInt(engineCylinders)) return false;
            if (color !== 'all' && !(car.variantes?.some(v => v.color === color) || car.color === color)) return false;
            if (passengers !== 'all' && car.pasajeros !== parseInt(passengers)) return false;
            return true;
        });

        if (debouncedSearchTerm) {
            const lowercasedTerm = debouncedSearchTerm.toLowerCase();
            filtered = filtered.filter(car => {
                const features = car.caracteristicas || [];
                return (
                    car.marca?.toLowerCase().includes(lowercasedTerm) ||
                    car.modelo?.toLowerCase().includes(lowercasedTerm) ||
                    car.tipo?.toLowerCase().includes(lowercasedTerm) ||
                    features.some(f => f.toLowerCase().includes(lowercasedTerm))
                );
            });
        }
        
        const getPrice = (car: Car) => car.variantes?.[0]?.precio ?? car.precio ?? 0;

        if (sortOrder === 'price-asc') {
            filtered.sort((a, b) => getPrice(a) - getPrice(b));
        } else if (sortOrder === 'price-desc') {
            filtered.sort((a, b) => getPrice(b) - getPrice(a));
        } else if (sortOrder === 'year-desc') {
            filtered.sort((a, b) => (b.anio || 0) - (a.anio || 0));
        }

        return filtered;
    }, [filters, debouncedSearchTerm, sortOrder, datosTodosLosAutos]);

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    const handleResetFilters = () => {
        setFilters({ brand: 'all', fuelType: 'all', transmission: 'all', price: MAX_PRICE, year: 'all', type: 'all', engineCylinders: 'all', color: 'all', passengers: 'all' });
        setSearchTerm('');
        setSortOrder('relevance');
    };
    
    if (isLoadingCars || !datosTodosLosAutos) {
        return <CatalogSkeleton />;
    }
    
    const sortComponent = (
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
          <SelectTrigger className="w-full md:w-[220px] focus-visible:ring-0 focus-visible:ring-offset-0">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevancia</SelectItem>
            <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
            <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
            <SelectItem value="year-desc">Año: Más reciente</SelectItem>
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
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          showSort={isMobile}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="container mx-auto px-4 py-8">
            <Breadcrumbs items={[{ label: 'Catálogo' }]} />
            <div className="relative flex flex-col lg:flex-row lg:gap-8 lg:items-start flex-grow">
                <AnimatePresence>
                {showFilters && (
                    <motion.aside
                        className="hidden lg:block lg:w-1/4 sticky top-24"
                        initial={{ width: 0, opacity: 0, marginRight: 0 }}
                        animate={{ width: '25%', opacity: 1, marginRight: '2rem' }}
                        exit={{ width: 0, opacity: 0, marginRight: 0, transition: { duration: 0.3 } }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    >
                        <div className="overflow-hidden">
                            {filterComponent}
                        </div>
                    </motion.aside>
                )}
                </AnimatePresence>
                
                <motion.main layout className="flex-1">
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
                                {sortComponent}
                            </div>
                        </div>
                    </div>

                    {filteredCars.length > 0 ? (
                       <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 lg:gap-8">
                            {filteredCars.map(car => (
                                <CarCard 
                                    key={`car-${car.id}`} 
                                    car={car}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <X className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">No se encontraron resultados</h2>
                            <p className="mt-2 text-muted-foreground">Intenta ajustar tus filtros o búsqueda.</p>
                        </div>
                    )}
                </motion.main>
            </div>
        </div>
      </motion.div>
    );
}

export default function Catalog() {
    return (
        <CatalogPageContent />
    )
}
