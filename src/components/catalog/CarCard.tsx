'use client';

import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Fuel, Gauge, GitCommit, Settings } from 'lucide-react';

interface CarCardProps {
  car: Car;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  selectionDisabled: boolean;
}

export default function CarCard({ car, isSelected, onToggleSelect, selectionDisabled }: CarCardProps) {
  const placeholder = findPlaceholderImage(car.image);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg duration-300 ease-in-out">
      <CardHeader className="p-0 relative">
        <Label
          htmlFor={`compare-${car.id}`}
          className="absolute top-4 right-4 z-10 bg-card/80 p-2 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
        >
          <Checkbox
            id={`compare-${car.id}`}
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(car.id)}
            disabled={selectionDisabled && !isSelected}
            aria-label={`Select ${car.brand} ${car.model} for comparison`}
          />
        </Label>
        <div className="aspect-[3/2] w-full overflow-hidden">
          {placeholder && (
            <Image
              src={placeholder.imageUrl}
              alt={`${car.brand} ${car.model}`}
              width={600}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={placeholder.imageHint}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-headline mb-2">{car.brand} {car.model}</CardTitle>
        <div className="text-sm text-muted-foreground mb-4">{car.year}</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-primary" />
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-primary" />
            <span>{car.horsepower} HP</span>
          </div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-primary" />
            <span>{car.mileage.toLocaleString()} {car.fuelType === 'Electric' ? 'mi' : 'MPG'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 bg-card/50">
        <div className="flex justify-between items-center w-full">
          <div className="text-2xl font-bold text-primary-foreground">
            ${car.price.toLocaleString()}
          </div>
          <Badge variant="secondary">{car.brand}</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
