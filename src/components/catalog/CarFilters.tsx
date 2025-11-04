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

  return (
    <div className="p-6 border rounded-lg bg-card">
      <h3 className="text-2xl font-bold mb-6">Filtros</h3>
      <div className="space-y-6">
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
      <Button variant="outline" className="w-full mt-8" onClick={onReset}>
        Restablecer Filtros
      </Button>
    </div>
  );
}
