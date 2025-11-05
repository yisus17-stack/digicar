'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Car } from '@/lib/types';
import { translations } from '@/lib/translations';
import { Loader, Sparkles } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { useMounted } from '@/hooks/use-mounted';
import { Skeleton } from '../ui/skeleton';

interface CarFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  onSearchWithAI: () => void;
  isLoading: boolean;
  cars: Car[];
  maxPrice: number;
  sortComponent?: React.ReactNode;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterSkeleton = () => <Skeleton className="h-10 w-full" />;

export default function CarFilters({ filters, onFilterChange, onReset, onSearchWithAI, isLoading, cars, maxPrice, sortComponent, searchTerm, setSearchTerm }: CarFiltersProps) {
  const isMounted = useMounted();
  
  const handleSelectChange = (name: string, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };
  
  const handleSliderChange = (value: number[]) => {
    onFilterChange({ ...filters, price: value[0] });
  };

  const uniqueBrands = [...new Set(cars.map(car => car.brand))];
  const uniqueYears = [...new Set(cars.map(car => car.year.toString()))].sort((a, b) => Number(b) - Number(a));
  const uniqueFuelTypes = [...new Set(cars.map(car => car.fuelType))];
  const uniqueTransmissions = [...new Set(cars.map(car => car.transmission))];
  const uniqueTypes = [...new Set(cars.map(car => car.type))];
  const uniqueCylinders = [...new Set(cars.map(car => car.engineCylinders.toString()))].filter(c => c !== '0').sort((a, b) => Number(a) - Number(b));
  const uniqueColors = [...new Set(cars.map(car => car.color))];
  const uniquePassengers = [...new Set(cars.map(car => car.passengers.toString()))].sort((a, b) => Number(a) - Number(b));


  return (
    <div className="p-6 md:border md:rounded-lg md:bg-card h-full flex flex-col">
      <div className="flex-grow space-y-6">
        {sortComponent && (
            <>
              <div>
                  <Label>Ordenar por</Label>
                  {isMounted ? sortComponent : <FilterSkeleton />}
              </div>
              <Separator />
            </>
        )}
        <h3 className="text-2xl font-bold md:hidden">Filtros</h3>
        <h3 className="text-2xl font-bold hidden md:block">Filtros</h3>
        
        <div>
          <Label>Describe tu auto ideal (IA)</Label>
          <Input
            type="text"
            placeholder="Ej: Un SUV familiar para 7 personas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        <div>
            <Label>Marca</Label>
            {isMounted ? (
              <Select value={filters.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
                  <SelectTrigger><SelectValue placeholder="Todas las marcas"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las marcas</SelectItem>
                      {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Precio: ${isMounted ? filters.price.toLocaleString() : filters.price}</Label>
            {isMounted ? (
              <Slider
                  min={0}
                  max={maxPrice}
                  step={50000}
                  value={[filters.price]}
                  onValueChange={handleSliderChange}
                  className="mt-2"
              />
            ) : <Skeleton className='h-5 w-full mt-2' />}
        </div>

        <div>
            <Label>Tipo</Label>
            {isMounted ? (
              <Select value={filters.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los tipos"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {uniqueTypes.map(type => <SelectItem key={type} value={type}>{translations.type[type as keyof typeof translations.type]}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Año</Label>
            {isMounted ? (
              <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los años"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los años</SelectItem>
                      {uniqueYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Combustible</Label>
            {isMounted ? (
              <Select value={filters.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los combustibles"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los combustibles</SelectItem>
                      {uniqueFuelTypes.map(type => <SelectItem key={type} value={type}>{translations.fuelType[type as keyof typeof translations.fuelType]}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Cilindros</Label>
            {isMounted ? (
              <Select value={filters.engineCylinders} onValueChange={(value) => handleSelectChange('engineCylinders', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los cilindros"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los cilindros</SelectItem>
                      {uniqueCylinders.map(cyl => <SelectItem key={cyl} value={cyl}>{cyl}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Color</Label>
            {isMounted ? (
              <Select value={filters.color} onValueChange={(value) => handleSelectChange('color', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los colores"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los colores</SelectItem>
                      {uniqueColors.map(color => <SelectItem key={color} value={color}>{translations.color[color as keyof typeof translations.color]}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Personas</Label>
            {isMounted ? (
              <Select value={filters.passengers} onValueChange={(value) => handleSelectChange('passengers', value)}>
                  <SelectTrigger><SelectValue placeholder="Cualquier capacidad"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Cualquier capacidad</SelectItem>
                      {uniquePassengers.map(pax => <SelectItem key={pax} value={pax}>{pax} Pasajeros</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>

        <div>
            <Label>Transmisión</Label>
            {isMounted ? (
              <Select value={filters.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
                  <SelectTrigger><SelectValue placeholder="Todas las transmisiones"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las transmisiones</SelectItem>
                      {uniqueTransmissions.map(type => <SelectItem key={type} value={type}>{translations.transmission[type as keyof typeof translations.transmission]}</SelectItem>)}
                  </SelectContent>
              </Select>
            ) : <FilterSkeleton />}
        </div>
      </div>
      <div className='space-y-2 mt-auto pt-8'>
        <Button onClick={onSearchWithAI} className="w-full" disabled={isLoading}>
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
          Buscar con IA
        </Button>
        <Button variant="outline" className="w-full" onClick={onReset}>
            Restablecer Filtros
        </Button>
      </div>
    </div>
  );
}
