
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader, Sparkles, PlusCircle } from 'lucide-react';
import { summarizeCarComparison } from '@/ai/flows/summarize-car-comparison';
import LeadCaptureForm from '../shared/LeadCaptureForm';
import { Separator } from '../ui/separator';
import { translations } from '@/lib/translations';
import Link from 'next/link';

interface ComparisonPageProps {
  cars: [Car, Car];
}

type Summary = {
    summary: string;
    recommendation: string;
}

export default function ComparisonPage({ cars }: ComparisonPageProps) {
  const [car1, car2] = cars;
  const car1Image = findPlaceholderImage(car1.image);
  const car2Image = findPlaceholderImage(car2.image);
  
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAiSummary = () => {
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
    { label: 'Precio', key: 'price' },
    { label: 'Año', key: 'year' },
    { label: 'Tipo', key: 'type' },
    { label: 'Kilometraje/Autonomía', key: 'mileage' },
    { label: 'Combustible', key: 'fuelType' },
    { label: 'Transmisión', key: 'transmission' },
    { label: 'Motor', key: 'engine' },
    { label: 'Caballos de Fuerza', key: 'horsepower' },
    { label: 'Cilindros', key: 'engineCylinders' },
    { label: 'Pasajeros', key: 'passengers' },
    { label: 'Color', key: 'color' },
  ];

  const formatValue = (key: string, car: Car) => {
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {[car1, car2].map((car, index) => {
          const image = index === 0 ? car1Image : car2Image;
          return (
            <Card key={car.id} className="overflow-hidden md:col-span-1">
              <div className="relative h-48 w-full">
                {image && (
                  <Image src={image.imageUrl} alt={car.model} layout="fill" className="object-cover" data-ai-hint={image.imageHint}/>
                )}
              </div>
              <CardHeader>
                <CardTitle>{car.brand} {car.model}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatValue('price', car)}</p>
                <p className="text-sm text-muted-foreground">{car.year}</p>
              </CardContent>
            </Card>
          );
        })}
        <div className="flex items-center justify-center h-full">
          <Button asChild variant="outline" className="w-full h-full md:w-auto md:h-auto md:aspect-square flex-col gap-2 border-dashed">
            <Link href="/catalog">
              <PlusCircle className="h-6 w-6 text-muted-foreground"/>
              <span className="text-muted-foreground">Añadir a la comparación</span>
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Especificaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {features.map(feature => (
            <div key={feature.key}>
              <div className="grid grid-cols-3 items-center gap-4 text-center">
                <div className="font-semibold text-left text-muted-foreground">{feature.label}</div>
                <div>{formatValue(feature.key, car1)}</div>
                <div>{formatValue(feature.key, car2)}</div>
              </div>
              <Separator className="mt-4"/>
            </div>
          ))}
          <div>
            <div className="grid grid-cols-3 items-start gap-4">
                <div className="font-semibold text-left text-muted-foreground pt-1">Características</div>
                <div className="text-center">
                    <ul className="list-disc list-inside text-left space-y-1 text-sm">
                        {car1.features.map(f => <li key={`${car1.id}-${f}`}>{f}</li>)}
                    </ul>
                </div>
                <div className="text-center">
                    <ul className="list-disc list-inside text-left space-y-1 text-sm">
                        {car2.features.map(f => <li key={`${car2.id}-${f}`}>{f}</li>)}
                    </ul>
                </div>
            </div>
             <Separator className="mt-4"/>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center">
          <Button size="lg" onClick={handleAiSummary} disabled={isPending}>
            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
            Obtener Resumen y Recomendación de IA
          </Button>
      </div>

      {summary && (
        <Card className="shadow-lg animate-in fade-in duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Análisis de IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-bold mb-2">Diferencias Clave</h3>
                    <p className="text-muted-foreground">{summary.summary}</p>
                </div>
                <div>
                    <h3 className="font-bold mb-2">Recomendación</h3>
                    <p className="text-muted-foreground">{summary.recommendation}</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>¿Interesado?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">Obtén una cotización personalizada o programa una prueba de manejo para uno de estos modelos.</p>
            <LeadCaptureForm interestedCars={`${car1.brand} ${car1.model}, ${car2.brand} ${car2.model}`} />
        </CardContent>
      </Card>

    </div>
  );
}

    