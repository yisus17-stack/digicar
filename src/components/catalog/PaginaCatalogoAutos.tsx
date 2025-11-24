'use client';

import { useState, useMemo, useTransition } from 'react';
import { useDebounce } from 'use-debounce';
import type { Auto } from '@/lib/types';
import FiltrosAuto from './FiltrosAuto';
import TarjetaAuto from './TarjetaAuto';
import TarjetaAutoMovil from './TarjetaAutoMovil';
import { X, SlidersHorizontal, GitCompareArrows, Car as IconoAuto } from 'lucide-react';
import { Button } from '../ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../ui/pagination';
import ResumenIA from './ResumenIA';
import { summarizeCatalogFilters } from '@/ai/flows/summarize-catalog-filters';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '../ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '../ui/scroll-area';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MigasDePan from '../layout/MigasDePan';

const ITEMS_POR_PAGINA = 6;
const PRECIO_MAXIMO = 2000000;

export type OrdenClasificacion = 'relevance' | 'price-asc' | 'price-desc' | 'year-desc';

const BarraComparacion = ({ idsSeleccionados, alQuitar, alLimpiar, alComparar, todosLosAutos }: { idsSeleccionados: string[], alQuitar: (id: string) => void, alLimpiar: () => void, alComparar: () => void, todosLosAutos: Auto[] }) => {
  const autosSeleccionados = todosLosAutos.filter(c => idsSeleccionados.includes(c.id));
  if (idsSeleccionados.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex items-center gap-4 overflow-x-auto">
            <h3 className="text-lg font-semibold whitespace-nowrap">Comparar ({idsSeleccionados.length}/2)</h3>
            <div className="flex items-center gap-4">
              {autosSeleccionados.map(auto => (
                <div key={auto.id} className="relative flex items-center gap-2 bg-muted p-2 rounded-lg">
                  {auto.imageUrl ? (
                    <Image src={auto.imageUrl} alt={auto.model} width={40} height={30} className="rounded object-cover" />
                  ) : (
                    <div className="w-10 h-8 flex items-center justify-center bg-secondary rounded">
                      <IconoAuto className="w-4 h-4 text-muted-foreground"/>
                    </div>
                  )}
                  <span className="text-sm font-medium hidden md:inline">{auto.brand} {auto.model}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => alQuitar(auto.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={alComparar} disabled={idsSeleccionados.length < 1} className="flex-1 sm:flex-none">
              <GitCompareArrows className="mr-2 h-4 w-4" />
              Comparar
            </Button>
            <Button variant="outline" onClick={alLimpiar} className="flex-1 sm:flex-none">Limpiar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function PaginaCatalogoAutos({ datosTodosLosAutos }: { datosTodosLosAutos: Auto[] }) {
  const router = useRouter();

  const [filtros, setFiltros] = useState({
    brand: 'all',
    fuelType: 'all',
    transmission: 'all',
    price: PRECIO_MAXIMO,
    year: 'all',
    type: 'all',
    engineCylinders: 'all',
    color: 'all',
    passengers: 'all',
  });
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [terminoBusquedaDebounced] = useDebounce(terminoBusqueda, 300);
  const [paginaActual, setPaginaActual] = useState(1);
  const [ordenClasificacion, setOrdenClasificacion] = useState<OrdenClasificacion>('relevance');
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const esMovil = useIsMobile();
  const [estaPanelAbierto, setEstaPanelAbierto] = useState(false);
  const [idsComparacion, setIdsComparacion] = useState<string[]>([]);
  


  const [resumenIA, setResumenIA] = useState('');
  const [cargandoIA, iniciarTransicionIA] = useTransition();

  const alternarComparacion = (autoId: string) => {
    setIdsComparacion(idsAnteriores => {
      if (idsAnteriores.includes(autoId)) {
        return idsAnteriores.filter(id => id !== autoId);
      }
      if (idsAnteriores.length < 2) {
        return [...idsAnteriores, autoId];
      }
      return idsAnteriores; // No hay cambios si ya hay 2 autos seleccionados
    });
  };

  const manejarComparacion = () => {
    router.push(`/compare?ids=${idsComparacion.join(',')}`);
  };

  const autosFiltrados = useMemo(() => {
    let filtrados = datosTodosLosAutos.filter(auto => {
      const { brand, fuelType, transmission, price, year, type, engineCylinders, color, passengers } = filtros;
      if (brand !== 'all' && auto.brand !== brand) return false;
      if (fuelType !== 'all' && auto.fuelType !== fuelType) return false;
      if (transmission !== 'all' && auto.transmission !== transmission) return false;
      if (auto.price > price) return false;
      if (year !== 'all' && auto.year !== parseInt(year)) return false;
      if (type !== 'all' && auto.type !== type) return false;
      if (engineCylinders !== 'all' && auto.engineCylinders !== parseInt(engineCylinders)) return false;
      if (color !== 'all' && auto.color !== color) return false;
      if (passengers !== 'all' && auto.passengers !== parseInt(passengers)) return false;
      return true;
    });

    if (terminoBusquedaDebounced) {
      const terminoMinusculas = terminoBusquedaDebounced.toLowerCase();
      filtrados = filtrados.filter(auto => 
        auto.brand.toLowerCase().includes(terminoMinusculas) ||
        auto.model.toLowerCase().includes(terminoMinusculas) ||
        auto.features.some(f => f.toLowerCase().includes(terminoMinusculas))
      );
    }

    if (ordenClasificacion === 'price-asc') {
      filtrados.sort((a, b) => a.price - b.price);
    } else if (ordenClasificacion === 'price-desc') {
      filtrados.sort((a, b) => b.price - a.price);
    } else if (ordenClasificacion === 'year-desc') {
      filtrados.sort((a, b) => b.year - a.year);
    }
    
    return filtrados;
  }, [filtros, terminoBusquedaDebounced, ordenClasificacion, datosTodosLosAutos]);

  const totalPaginas = Math.ceil(autosFiltrados.length / ITEMS_POR_PAGINA);
  const autosPaginados = autosFiltrados.slice(
    (paginaActual - 1) * ITEMS_POR_PAGINA,
    paginaActual * ITEMS_POR_PAGINA
  );

  const cambiarPagina = (pagina: number) => {
    setPaginaActual(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cambiarFiltro = (nuevosFiltros: any) => {
    setFiltros(nuevosFiltros);
    setPaginaActual(1);
  };
  
  const resetearFiltros = () => {
    setFiltros({
      brand: 'all',
      fuelType: 'all',
      transmission: 'all',
      price: PRECIO_MAXIMO,
      year: 'all',
      type: 'all',
      engineCylinders: 'all',
      color: 'all',
      passengers: 'all',
    });
    setTerminoBusqueda('');
    setResumenIA('');
    setPaginaActual(1);
    setOrdenClasificacion('relevance');
  };
  
  const aplicarFiltrosMovil = () => {
    setPaginaActual(1);
    setEstaPanelAbierto(false);
  }

  const buscarConIA = () => {
    iniciarTransicionIA(async () => {
      setResumenIA('');
      const resultado = await summarizeCatalogFilters({
        filters: JSON.stringify(filtros),
        userDescription: terminoBusqueda,
        carList: JSON.stringify(autosFiltrados.map(c => ({id: c.id, brand: c.brand, model: c.model, features: c.features, price: c.price})))
      });
      setResumenIA(resultado.recommendation);
      if (esMovil) {
        setEstaPanelAbierto(false);
      }
    });
  };

  const opcionesClasificacion = (
    <Select value={ordenClasificacion} onValueChange={(value) => setOrdenClasificacion(value as OrdenClasificacion)}>
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

  const componenteFiltros = (
    <FiltrosAuto 
      filters={filtros}
      onFilterChange={cambiarFiltro}
      onReset={resetearFiltros}
      onSearchWithAI={buscarConIA}
      isLoading={cargandoIA}
      cars={datosTodosLosAutos}
      maxPrice={PRECIO_MAXIMO}
      sortComponent={esMovil ? opcionesClasificacion : undefined}
      searchTerm={terminoBusqueda}
      setSearchTerm={setTerminoBusqueda}
    />
  );


  return (
    <div className="container mx-auto px-4 py-8 pb-32">
      <MigasDePan items={[{ label: 'Catálogo' }]} />

      <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start flex-grow">
        <aside className={cn('hidden lg:block lg:w-1/4', !mostrarFiltros && 'lg:hidden')}>
            {componenteFiltros}
        </aside>

        <main className={cn('flex flex-1 flex-col', !mostrarFiltros && 'lg:w-full')}>
            <div className='flex justify-between items-center mb-6'>
              <p className="text-sm text-muted-foreground">{autosFiltrados.length} resultados</p>
              <div className='flex items-center gap-4'>
                <div className='lg:hidden'>
                  <Sheet open={estaPanelAbierto} onOpenChange={setEstaPanelAbierto}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <SlidersHorizontal className='mr-2 h-4 w-4' />
                        Filtrar y Ordenar
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="flex flex-col w-full">
                      <SheetHeader>
                        <SheetTitle>Filtrar y Ordenar</SheetTitle>
                      </SheetHeader>
                      <ScrollArea className="flex-1">
                        <div className='pr-6'>
                          {componenteFiltros}
                        </div>
                      </ScrollArea>
                      <SheetFooter className="pt-4 border-t">
                        <Button onClick={aplicarFiltrosMovil} className='w-full'>Aplicar</Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className='hidden lg:flex items-center gap-4'>
                    <Button variant="ghost" size="sm" onClick={() => setMostrarFiltros(prev => !prev)}>
                      <SlidersHorizontal className='mr-2 h-4 w-4' />
                      {mostrarFiltros ? "Ocultar filtros" : "Mostrar filtros"}
                    </Button>
                    {opcionesClasificacion}
                </div>
              </div>
            </div>

            { (cargandoIA || resumenIA) && <ResumenIA summary={resumenIA} /> }
            
            <div className="flex-grow">
                {/* Vista Móvil */}
                <div className="md:hidden border rounded-lg overflow-hidden">
                  {autosPaginados.map(auto => (
                    <TarjetaAutoMovil 
                      key={`mobile-${auto.id}`} 
                      auto={auto}
                      estaSeleccionado={idsComparacion.includes(auto.id)}
                      alAlternarComparacion={alternarComparacion}
                    />
                  ))}
                </div>


                {/* Vista de Escritorio */}
                <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {autosPaginados.map(auto => (
                        <TarjetaAuto 
                          key={`desktop-${auto.id}`} 
                          auto={auto}
                          estaSeleccionado={idsComparacion.includes(auto.id)}
                          alAlternarComparacion={alternarComparacion}
                        />
                    ))}
                </div>

                {autosFiltrados.length === 0 && !cargandoIA && (
                    <div className="text-center py-16">
                        <X className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">No se encontraron resultados</h2>
                        <p className="mt-2 text-muted-foreground">Intenta ajustar tus filtros o búsqueda.</p>
                    </div>
                )}
            </div>

            <div className='pt-8 mt-auto'>
              {totalPaginas > 1 && (
                  <Pagination>
                  <PaginationContent>
                      <PaginationItem>
                      <PaginationPrevious 
                          href="#"
                          onClick={(e) => { e.preventDefault(); cambiarPagina(Math.max(1, paginaActual - 1)); }}
                          className={paginaActual === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                      </PaginationItem>
                      {[...Array(totalPaginas)].map((_, i) => (
                      <PaginationItem key={i}>
                          <PaginationLink 
                              href="#"
                              isActive={paginaActual === i + 1}
                              onClick={(e) => { e.preventDefault(); cambiarPagina(i + 1); }}
                          >
                          {i + 1}
                          </PaginationLink>
                      </PaginationItem>
                      ))}
                      <PaginationItem>
                      <PaginationNext 
                          href="#"
                          onClick={(e) => { e.preventDefault(); cambiarPagina(Math.min(totalPaginas, paginaActual + 1)); }}
                          className={paginaActual === totalPaginas ? 'pointer-events-none opacity-50' : ''}
                      />
                      </PaginationItem>
                  </PaginationContent>
                  </Pagination>
              )}
            </div>
        </main>
      </div>
      <BarraComparacion 
        idsSeleccionados={idsComparacion}
        alQuitar={alternarComparacion}
        alLimpiar={() => setIdsComparacion([])}
        alComparar={manejarComparacion}
        todosLosAutos={datosTodosLosAutos}
      />
    </div>
  );
}
