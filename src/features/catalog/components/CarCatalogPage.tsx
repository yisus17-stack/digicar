'use client';

import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import type { Car } from '@/core/types';
import CarFilters from './CarFilters';
import CarCard from './CarCard';
import CarCardMobile from './CarCardMobile';
import { X, SlidersHorizontal, GitCompareArrows, Car as CarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const ITEMS_PER_PAGE = 6;
const MAX_PRICE = 2000000;

export type SortOrder = 'relevance' | 'price-asc' | 'price-desc' | 'year-desc';

export const ComparisonBar = ({ selectedIds, onRemove, onClear, onCompare, allCars }: { selectedIds: string[], onRemove: (id: string) => void, onClear: () => void, onCompare: () => void, allCars: Car[] }) => {
  const selectedCars = allCars.filter(c => selectedIds.includes(c.id));
  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex-1 flex items-center gap-4 overflow-x-auto">
            <h3 className="text-lg font-semibold whitespace-nowrap">Comparar ({selectedIds.length}/2)</h3>
            <div className="flex items-center gap-4">
              {selectedCars.map(car => (
                <div key={car.id} className="relative flex items-center gap-2 bg-muted p-2 rounded-lg">
                  {car.imagenUrl ? (
                    <Image src={car.imagenUrl} alt={car.modelo} width={40} height={30} className="rounded object-cover" />
                  ) : (
                    <div className="w-10 h-8 flex items-center justify-center bg-secondary rounded">
                      <CarIcon className="w-4 h-4 text-muted-foreground"/>
                    </div>
                  )}
                  <span className="text-sm font-medium hidden md:inline">{car.marca} {car.modelo}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onRemove(car.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={onCompare} disabled={selectedIds.length < 1} className="flex-1 sm:flex-none">
              <GitCompareArrows className="mr-2 h-4 w-4" />
              Comparar
            </Button>
            <Button variant="outline" onClick={onClear} className="flex-1 sm:flex-none">Limpiar</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
