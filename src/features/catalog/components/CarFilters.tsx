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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { traducciones } from '@/lib/translations';
import type { SortOrder } from '@/app/catalogo/page';

interface CarFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  cars: Car[];
  maxPrice: number;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  showSort?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const FilterSkeleton = () => <Skeleton className="h-10 w-full" />;

export default function CarFilters({ filters, onFilterChange, onReset, cars, maxPrice, sortOrder, setSortOrder, showSort, searchTerm, setSearchTerm }: CarFiltersProps) {
  const handleSelectChange = (name: string, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };
  
  const handleSliderChange = (value: number[]) => {
    onFilterChange({ ...filters, price: value[0] });
  };

  const uniqueBrands = [...new Set(cars.map(car => car.marca))];
  const uniqueYears = [...new Set(cars.map(car => car.anio.toString()))].sort((a, b) => Number(b) - Number(a));
  const uniqueFuelTypes = [...new Set(cars.map(car => car.tipoCombustible))];
  const uniqueTransmissions = [...new Set(cars.map(car => car.transmision))];
  const uniqueTypes = [...new Set(cars.map(car => car.tipo))];
  const uniqueCylinders = [...new Set(cars.map(car => car.cilindrosMotor.toString()))].filter(c => c !== '0').sort((a, b) => Number(a) - Number(b));
  const uniqueColors = [...new Set(cars.flatMap(car => car.variantes?.map(v => v.color) ?? (car.color ? [car.color] : [])))].filter(Boolean) as string[];
  const uniquePassengers = [...new Set(cars.map(car => car.pasajeros.toString()))].sort((a, b) => Number(a) - Number(b));

  const sortComponent = (
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


  return (
    <div className="p-6 md:border md:rounded-lg md:bg-card h-full flex flex-col">
      <div className="flex-grow space-y-6">
        {showSort && (
            <>
              <div>
                  <Label>Ordenar por</Label>
                  {sortComponent}
              </div>
            </>
        )}
        <h3 className="text-2xl font-bold">Filtros</h3>
        
        <div>
          <Label>Búsqueda por palabra clave</Label>
          <Input
            type="text"
            placeholder="Busca por marca, modelo, tipo o característica..."
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
                      {uniqueTypes.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{traducciones.tipo[type as keyof typeof traducciones.tipo] || type}</SelectItem>)}
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
                      {uniqueFuelTypes.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{traducciones.tipoCombustible[type as keyof typeof traducciones.tipoCombustible] || type}</SelectItem>)}
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
                      {uniqueColors.map((color, index) => <SelectItem key={`${color}-${index}`} value={color}>{traducciones.color[color as keyof typeof traducciones.color] || color}</SelectItem>)}
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
                      {uniqueTransmissions.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{traducciones.transmision[type as keyof typeof traducciones.transmision] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>
      </div>
      <div className='space-y-2 mt-auto pt-8'>
        <Button variant="outline" className="w-full" onClick={onReset}>
            Restablecer Filtros
        </Button>
      </div>
    </div>
  );
}
