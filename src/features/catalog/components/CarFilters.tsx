'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Car } from '@/core/types';
import { Loader, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { translations } from '@/lib/translations';

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
                  {sortComponent}
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
              <Select value={filters.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
                  <SelectTrigger><SelectValue placeholder="Todas las marcas"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las marcas</SelectItem>
                      {uniqueBrands.map((brand, index) => <SelectItem key={`${brand}-${index}`} value={brand}>{brand}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Precio: ${filters.price.toLocaleString('es-MX')}</Label>
              <Slider
                  min={0}
                  max={maxPrice}
                  step={50000}
                  value={[filters.price]}
                  onValueChange={handleSliderChange}
                  className="mt-2"
              />
        </div>

        <div>
            <Label>Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los tipos"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {uniqueTypes.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{translations.type[type as keyof typeof translations.type] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Año</Label>
              <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los años"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los años</SelectItem>
                      {uniqueYears.map((year, index) => <SelectItem key={`${year}-${index}`} value={year}>{year}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Combustible</Label>
              <Select value={filters.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los combustibles"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los combustibles</SelectItem>
                      {uniqueFuelTypes.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{translations.fuelType[type as keyof typeof translations.fuelType] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Cilindros</Label>
              <Select value={filters.engineCylinders} onValueChange={(value) => handleSelectChange('engineCylinders', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los cilindros"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los cilindros</SelectItem>
                      {uniqueCylinders.map((cyl, index) => <SelectItem key={`${cyl}-${index}`} value={cyl}>{cyl}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Color</Label>
              <Select value={filters.color} onValueChange={(value) => handleSelectChange('color', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los colores"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los colores</SelectItem>
                      {uniqueColors.map((color, index) => <SelectItem key={`${color}-${index}`} value={color}>{translations.color[color as keyof typeof translations.color] || color}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Personas</Label>
              <Select value={filters.passengers} onValueChange={(value) => handleSelectChange('passengers', value)}>
                  <SelectTrigger><SelectValue placeholder="Cualquier capacidad"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Cualquier capacidad</SelectItem>
                      {uniquePassengers.map((pax, index) => <SelectItem key={`${pax}-${index}`} value={pax}>{pax} Pasajeros</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Transmisión</Label>
              <Select value={filters.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
                  <SelectTrigger><SelectValue placeholder="Todas las transmisiones"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las transmisiones</SelectItem>
                      {uniqueTransmissions.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{translations.transmission[type as keyof typeof translations.transmission] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
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
