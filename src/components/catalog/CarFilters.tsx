
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
import { Loader, Sparkles } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Dictionary } from '@/lib/get-dictionary';

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
  dictionary: Dictionary;
}

const FilterSkeleton = () => <Skeleton className="h-10 w-full" />;

export default function CarFilters({ filters, onFilterChange, onReset, onSearchWithAI, isLoading, cars, maxPrice, sortComponent, searchTerm, setSearchTerm, dictionary }: CarFiltersProps) {
  const d = dictionary.catalog.filters;
  const c = dictionary.compare.features;
  
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
                  <Label>{d.sort_by_label}</Label>
                  {sortComponent}
              </div>
              <Separator />
            </>
        )}
        <h3 className="text-2xl font-bold md:hidden">{d.title}</h3>
        <h3 className="text-2xl font-bold hidden md:block">{d.title}</h3>
        
        <div>
          <Label>{d.ai_search_label}</Label>
          <Input
            type="text"
            placeholder={d.ai_search_placeholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        <div>
            <Label>{d.brand_label}</Label>
              <Select value={filters.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_brands}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_brands}</SelectItem>
                      {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.price_label}: ${filters.price.toLocaleString('es-MX')}</Label>
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
            <Label>{d.type_label}</Label>
              <Select value={filters.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_types}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_types}</SelectItem>
                      {uniqueTypes.map(type => <SelectItem key={type} value={type}>{c[type.toLowerCase() as keyof typeof c] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.year_label}</Label>
              <Select value={filters.year} onValueChange={(value) => handleSelectChange('year', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_years}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_years}</SelectItem>
                      {uniqueYears.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.fuel_label}</Label>
              <Select value={filters.fuelType} onValueChange={(value) => handleSelectChange('fuelType', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_fuels}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_fuels}</SelectItem>
                      {uniqueFuelTypes.map(type => <SelectItem key={type} value={type}>{c[type.toLowerCase() as keyof typeof c] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.cylinders_label}</Label>
              <Select value={filters.engineCylinders} onValueChange={(value) => handleSelectChange('engineCylinders', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_cylinders}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_cylinders}</SelectItem>
                      {uniqueCylinders.map(cyl => <SelectItem key={cyl} value={cyl}>{cyl}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.color_label}</Label>
              <Select value={filters.color} onValueChange={(value) => handleSelectChange('color', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_colors}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_colors}</SelectItem>
                      {uniqueColors.map(color => <SelectItem key={color} value={color}>{c[color.toLowerCase() as keyof typeof c] || color}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.passengers_label}</Label>
              <Select value={filters.passengers} onValueChange={(value) => handleSelectChange('passengers', value)}>
                  <SelectTrigger><SelectValue placeholder={d.any_capacity}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.any_capacity}</SelectItem>
                      {uniquePassengers.map(pax => <SelectItem key={pax} value={pax}>{pax} {d.passengers_suffix}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>

        <div>
            <Label>{d.transmission_label}</Label>
              <Select value={filters.transmission} onValueChange={(value) => handleSelectChange('transmission', value)}>
                  <SelectTrigger><SelectValue placeholder={d.all_transmissions}/></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{d.all_transmissions}</SelectItem>
                      {uniqueTransmissions.map(type => <SelectItem key={type} value={type}>{c[type.toLowerCase() as keyof typeof c] || type}</SelectItem>)}
                  </SelectContent>
              </Select>
        </div>
      </div>
      <div className='space-y-2 mt-auto pt-8'>
        <Button onClick={onSearchWithAI} className="w-full" disabled={isLoading}>
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
          {d.ai_search_button}
        </Button>
        <Button variant="outline" className="w-full" onClick={onReset}>
            {d.reset_button}
        </Button>
      </div>
    </div>
  );
}
