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
import { ScrollArea } from '../ui/scroll-area';

interface CarFiltersProps {
  filters: any;
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  cars: Car[];
}

export default function CarFilters({ filters, onFilterChange, onReset, cars }: CarFiltersProps) {
  const handleSelectChange = (name: string, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };
  
  const handleSliderChange = (value: number[]) => {
    onFilterChange({ ...filters, priceRange: value });
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
    <div className="p-6 border rounded-lg bg-card h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-6">Filtros</h3>
      <ScrollArea className="flex-grow">
        <div className="space-y-6 pr-4">
          <div>
              <Label>Marca</Label>
              <Select value={filters.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las marcas</SelectItem>
                      {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {uniqueTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Año</Label>
              <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los años</SelectItem>
                      {uniqueYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Rango de Precio: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}</Label>
              <Slider
                  min={0}
                  max={200000}
                  step={5000}
                  value={filters.priceRange}
                  onValueChange={handleSliderChange}
                  className="mt-2"
              />
          </div>

          <div>
              <Label>Combustible</Label>
              <Select value={filters.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los combustibles</SelectItem>
                      {uniqueFuelTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Cilindros</Label>
              <Select value={filters.engineCylinders} onValueChange={(value) => handleSelectChange('engineCylinders', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los cilindros</SelectItem>
                      {uniqueCylinders.map(cyl => <SelectItem key={cyl} value={cyl}>{cyl}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Color</Label>
              <Select value={filters.color} onValueChange={(value) => handleSelectChange('color', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todos los colores</SelectItem>
                      {uniqueColors.map(color => <SelectItem key={color} value={color}>{color}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Personas</Label>
              <Select value={filters.passengers} onValueChange={(value) => handleSelectChange('passengers', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Cualquier capacidad</SelectItem>
                      {uniquePassengers.map(pax => <SelectItem key={pax} value={pax}>{pax} Pasajeros</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div>
              <Label>Transmisión</Label>
              <Select value={filters.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">Todas las transmisiones</SelectItem>
                      {uniqueTransmissions.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>
        </div>
      </ScrollArea>
      <Button variant="outline" className="w-full mt-8" onClick={onReset}>
        Restablecer Filtros
      </Button>
    </div>
  );
}
