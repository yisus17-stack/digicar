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
import { Auto } from '@/lib/types';
import { Loader, Sparkles } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { traducciones } from '@/lib/traducciones';

interface FiltrosAutoProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  onSearchWithAI: () => void;
  isLoading: boolean;
  cars: Auto[];
  maxPrice: number;
  sortComponent?: React.ReactNode;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EsqueletoFiltro = () => <Skeleton className="h-10 w-full" />;

export default function FiltrosAuto({ filters, onFilterChange, onReset, onSearchWithAI, isLoading, cars, maxPrice, sortComponent, searchTerm, setSearchTerm }: FiltrosAutoProps) {
  const cambiarSeleccion = (name: string, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };
  
  const cambiarSlider = (value: number[]) => {
    onFilterChange({ ...filters, price: value[0] });
  };

  const marcasUnicas = [...new Set(cars.map(car => car.brand))];
  const aniosUnicos = [...new Set(cars.map(car => car.year.toString()))].sort((a, b) => Number(b) - Number(a));
  const tiposCombustibleUnicos = [...new Set(cars.map(car => car.fuelType))];
  const transmisionesUnicas = [...new Set(cars.map(car => car.transmission))];
  const tiposUnicos = [...new Set(cars.map(car => car.type))];
  const cilindrosUnicos = [...new Set(cars.map(car => car.engineCylinders.toString()))].filter(c => c !== '0').sort((a, b) => Number(a) - Number(b));
  const coloresUnicos = [...new Set(cars.map(car => car.color))];
  const pasajerosUnicos = [...new Set(cars.map(car => car.passengers.toString()))].sort((a, b) => Number(a) - Number(b));


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
              <Select value={filters.brand} onValueChange={(value) => cambiarSeleccion('brand', value)}>
                  <SelectTrigger><SelectValue placeholder="Todas las marcas"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las marcas</SelectItem>
                      {marcasUnicas.map((brand, index) => <SelectItem key={`${brand}-${index}`} value={brand}>{brand}</SelectItem>)}
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
                  onValueChange={cambiarSlider}
                  className="mt-2"
              />
        </div>

        <div>
            <Label>Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => cambiarSeleccion('type', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los tipos"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {tiposUnicos.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{traducciones.type[type as keyof typeof traducciones.type] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Año</Label>
              <Select value={filters.year} onValueChange={(value) => cambiarSeleccion('year', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los años"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los años</SelectItem>
                      {aniosUnicos.map((year, index) => <SelectItem key={`${year}-${index}`} value={year}>{year}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Combustible</Label>
              <Select value={filters.fuelType} onValueChange={(value) => cambiarSeleccion('fuelType', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los combustibles"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los combustibles</SelectItem>
                      {tiposCombustibleUnicos.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{traducciones.fuelType[type as keyof typeof traducciones.fuelType] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Cilindros</Label>
              <Select value={filters.engineCylinders} onValueChange={(value) => cambiarSeleccion('engineCylinders', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los cilindros"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los cilindros</SelectItem>
                      {cilindrosUnicos.map((cyl, index) => <SelectItem key={`${cyl}-${index}`} value={cyl}>{cyl}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Color</Label>
              <Select value={filters.color} onValueChange={(value) => cambiarSeleccion('color', value)}>
                  <SelectTrigger><SelectValue placeholder="Todos los colores"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los colores</SelectItem>
                      {coloresUnicos.map((color, index) => <SelectItem key={`${color}-${index}`} value={color}>{traducciones.color[color as keyof typeof traducciones.color] || color}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Personas</Label>
              <Select value={filters.passengers} onValueChange={(value) => cambiarSeleccion('passengers', value)}>
                  <SelectTrigger><SelectValue placeholder="Cualquier capacidad"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Cualquier capacidad</SelectItem>
                      {pasajerosUnicos.map((pax, index) => <SelectItem key={`${pax}-${index}`} value={pax}>{pax} Pasajeros</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>Transmisión</Label>
              <Select value={filters.transmission} onValueChange={(value) => cambiarSeleccion('transmission', value)}>
                  <SelectTrigger><SelectValue placeholder="Todas las transmisiones"/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las transmisiones</SelectItem>
                      {transmisionesUnicas.map((type, index) => <SelectItem key={`${type}-${index}`} value={type}>{traducciones.transmission[type as keyof typeof traducciones.transmission] || type}</SelectItem>)}
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
