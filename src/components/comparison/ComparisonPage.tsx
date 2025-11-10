
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Sparkles, PlusCircle } from 'lucide-react';
import { summarizeCarComparison } from '@/ai/flows/summarize-car-comparison';
import LeadCaptureForm from '../shared/LeadCaptureForm';
import { Separator } from '../ui/separator';
import { translations } from '@/lib/translations';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRouter } from 'next/navigation';
import { Dictionary } from '@/lib/get-dictionary';

interface ComparisonPageProps {
  cars: [Car] | [Car, Car];
  allCars: Car[];
  dictionary: Dictionary['compare'];
}

type Summary = {
    summary: string;
    recommendation: string;
}

export default function ComparisonPage({ cars, allCars, dictionary }: ComparisonPageProps) {
  const router = useRouter();
  const [car1, car2] = cars;
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSelectCar = (position: 'car1' | 'car2', carId: string) => {
    const currentIds = cars.map(c => c.id);
    let newIds: string[];

    if (position === 'car1') {
        newIds = [carId, currentIds[1]].filter(Boolean);
    } else {
        newIds = [currentIds[0], carId].filter(Boolean);
    }
    router.push(`/compare?ids=${newIds.join(',')}`);
  };

  const handleAiSummary = () => {
    if (!car1 || !car2) return;
    const car1Features = JSON.stringify(car1);
    const car2Features = JSON.stringify(car2);
    const userNeeds = "Quiero un auto equilibrado. Considera el precio, el rendimiento y las características.";

    startTransition(async () => {
        setSummary(null);
        try {
            const result = await summarizeCarComparison({ car1Features, car2Features, userNeeds });
            setSummary(result);
        } catch (error) {
            setSummary({ summary: 'No se pudo generar el resumen.', recommendation: 'Ocurrió un error.' });
        }
    });
  };

  const features = [
    { label: dictionary.features.price, key: 'price' },
    { label: dictionary.features.year, key: 'year' },
    { label: dictionary.features.type, key: 'type' },
    { label: dictionary.features.mileage, key: 'mileage' },
    { label: dictionary.features.fuel, key: 'fuelType' },
    { label: dictionary.features.transmission, key: 'transmission' },
    { label: dictionary.features.engine, key: 'engine' },
    { label: dictionary.features.horsepower, key: 'horsepower' },
    { label: dictionary.features.cylinders, key: 'engineCylinders' },
    { label: dictionary.features.passengers, key: 'passengers' },
    { label: dictionary.features.color, key: 'color' },
  ];

  const formatValue = (key: string, car?: Car) => {
    if (!car) return '-';
    const value = car[key as keyof Car];
    switch (key) {
      case 'price': return `$${Number(value).toLocaleString('es-MX')}`;
      case 'mileage': return `${Number(value).toLocaleString('es-MX')} ${car.fuelType === 'Electric' ? 'km' : 'KPL'}`;
      case 'horsepower': return `${value} HP`;
      case 'type': return translations.type[value as keyof typeof translations.type];
      case 'fuelType': return translations.fuelType[value as keyof typeof translations.fuelType];
      case 'transmission': return translations.transmission[value as keyof typeof translations.transmission];
      case 'color': return translations.color[value as keyof typeof translations.color];
      default: return value;
    }
  }
  
  const CarSelector = ({ selectedCar, onSelect, position, otherCarId }: { selectedCar?: Car, onSelect: (pos: 'car1' | 'car2', carId: string) => void, position: 'car1' | 'car2', otherCarId?: string }) => {
    const availableCars = allCars.filter(c => c.id !== otherCarId);
    
    if (selectedCar) {
      const image = findPlaceholderImage(selectedCar.id);
      return (
        <Card className="overflow-hidden md:col-span-1 w-full">
          <div className="relative h-48 w-full">
            {image && <Image src={image.imageUrl} alt={selectedCar.model} layout="fill" className="object-cover" data-ai-hint={image.imageHint}/>}
          </div>
          <CardHeader>
            <CardTitle>{selectedCar.brand} {selectedCar.model}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatValue('price', selectedCar)}</p>
            <p className="text-sm text-muted-foreground">{selectedCar.year}</p>
          </CardContent>
        </Card>
      )
    }

    return (
        <Card className="w-full h-full min-h-[200px] flex flex-col items-center justify-center border-dashed p-4">
            <PlusCircle className="h-10 w-10 text-muted-foreground mb-4"/>
            <p className="text-muted-foreground mb-4 text-center">{dictionary.add_car_to_compare}</p>
            <Select onValueChange={(carId) => onSelect(position, carId)}>
                <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder={dictionary.select_car_placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {availableCars.map(car => (
                        <SelectItem key={car.id} value={car.id}>
                            {car.brand} {car.model}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="link" asChild className="mt-2">
                <Link href="/catalog">{dictionary.search_in_catalog}</Link>
            </Button>
        </Card>
    );
  };


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <CarSelector selectedCar={car1} onSelect={handleSelectCar} position="car1" otherCarId={car2?.id} />
        <CarSelector selectedCar={car2} onSelect={handleSelectCar} position="car2" otherCarId={car1?.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{dictionary.specifications_title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map(feature => (
            <div key={feature.key}>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="font-semibold text-left text-muted-foreground col-span-1">{feature.label}</div>
                <div className="text-center col-span-1">{formatValue(feature.key, car1)}</div>
                <div className="text-center col-span-1">{formatValue(feature.key, car2)}</div>
              </div>
              <Separator className="mt-4"/>
            </div>
          ))}
          <div>
            <div className="grid grid-cols-3 items-start gap-4">
                <div className="font-semibold text-left text-muted-foreground pt-1 col-span-1">{dictionary.features.title}</div>
                <div className="text-center col-span-1">
                    <ul className="list-disc list-inside text-left space-y-1 text-sm">
                        {car1?.features.map(f => <li key={`${car1.id}-${f}`}>{f}</li>)}
                    </ul>
                </div>
                <div className="text-center col-span-1">
                    <ul className="list-disc list-inside text-left space-y-1 text-sm">
                        {car2?.features.map(f => <li key={`${car2.id}-${f}`}>{f}</li>)}
                    </ul>
                </div>
            </div>
             <Separator className="mt-4"/>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
          <Button size="lg" onClick={handleAiSummary} disabled={isPending || !car1 || !car2}>
            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
            {dictionary.get_ai_summary_button}
          </Button>
      </div>

      {summary && (
        <Card className="shadow-lg animate-in fade-in duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> {dictionary.ai_analysis_title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-bold mb-2">{dictionary.key_differences_title}</h3>
                    <p className="text-muted-foreground">{summary.summary}</p>
                </div>
                <div>
                    <h3 className="font-bold mb-2">{dictionary.recommendation_title}</h3>
                    <p className="text-muted-foreground">{summary.recommendation}</p>
                </div>
            </CardContent>
        </Card>
      )}

      {(car1 || car2) && (
        <Card>
          <CardHeader>
              <CardTitle>{dictionary.interested_title}</CardTitle>
          </CardHeader>
          <CardContent>
              <p className="text-muted-foreground mb-4">{dictionary.interested_subtitle}</p>
              <LeadCaptureForm interestedCars={[car1, car2].filter(Boolean).map(c => `${c?.brand} ${c?.model}`).join(', ')} />
          </CardContent>
        </Card>
      )}

    </div>
  );
}
