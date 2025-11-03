'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import type { Car } from '@/lib/types';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Sparkles } from 'lucide-react';
import { summarizeCarComparison } from '@/ai/flows/summarize-car-comparison';
import LeadCaptureForm from '../shared/LeadCaptureForm';

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
    const userNeeds = "I want a balanced car. Consider price, performance, and features.";

    startTransition(async () => {
        setSummary(null);
        try {
            const result = await summarizeCarComparison({ car1Features, car2Features, userNeeds });
            setSummary(result);
        } catch (error) {
            setSummary({ summary: 'Could not generate summary.', recommendation: 'An error occurred.' });
        }
    });
  };

  const features = [
    { label: 'Price', key: 'price' },
    { label: 'Year', key: 'year' },
    { label: 'Mileage', key: 'mileage' },
    { label: 'Fuel Type', key: 'fuelType' },
    { label: 'Transmission', key: 'transmission' },
    { label: 'Engine', key: 'engine' },
    { label: 'Horsepower', key: 'horsepower' },
  ];

  const formatValue = (key: string, value: any) => {
    if (key === 'price') return `$${Number(value).toLocaleString()}`;
    if (key === 'mileage') return `${Number(value).toLocaleString()} ${value.fuelType === 'Electric' ? 'mi' : 'MPG'}`;
    if (key === 'horsepower') return `${value} HP`;
    return value;
  }

  return (
    <div className="space-y-12">
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Feature</TableHead>
              {[car1, car2].map((car, index) => {
                const image = index === 0 ? car1Image : car2Image;
                return (
                  <TableHead key={car.id}>
                    <div className="flex flex-col items-center gap-4">
                        {image && (
                           <Image src={image.imageUrl} alt={car.model} width={300} height={200} className="rounded-md object-cover" data-ai-hint={image.imageHint}/>
                        )}
                        <span className="text-lg font-bold font-headline">{car.brand} {car.model}</span>
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map(feature => (
              <TableRow key={feature.key}>
                <TableCell className="font-medium">{feature.label}</TableCell>
                <TableCell>{formatValue(feature.key, car1[feature.key as keyof Car])}</TableCell>
                <TableCell>{formatValue(feature.key, car2[feature.key as keyof Car])}</TableCell>
              </TableRow>
            ))}
            <TableRow>
                <TableCell className="font-medium">All Features</TableCell>
                <TableCell>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {car1.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                </TableCell>
                <TableCell>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        {car2.features.map(f => <li key={f}>{f}</li>)}
                    </ul>
                </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      
      <div className="text-center">
          <Button size="lg" onClick={handleAiSummary} disabled={isPending}>
            {isPending ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
            Get AI Summary & Recommendation
          </Button>
      </div>

      {summary && (
        <Card className="shadow-lg animate-in fade-in duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-bold mb-2">Key Differences</h3>
                    <p className="text-muted-foreground">{summary.summary}</p>
                </div>
                <div>
                    <h3 className="font-bold mb-2">Recommendation</h3>
                    <p className="text-muted-foreground">{summary.recommendation}</p>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Interested?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground mb-4">Get a personalized quote or schedule a test drive for one of these models.</p>
            <LeadCaptureForm interestedCars={`${car1.brand} ${car1.model}, ${car2.brand} ${car2.model}`} />
        </CardContent>
      </Card>

    </div>
  );
}
