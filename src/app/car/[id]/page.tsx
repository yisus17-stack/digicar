'use client';

import Image from 'next/image';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Zap, Droplets, Gauge, Users, Palette, GitMerge, Settings } from 'lucide-react';
import LeadCaptureForm from '@/components/shared/LeadCaptureForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { translations } from '@/lib/translations';
import SketchfabViewer from '@/components/sketchfab/SketchfabViewer';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Car } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function CarDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <Skeleton className="h-[450px] w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const carRef = useMemoFirebase(() => doc(firestore, 'cars', params.id), [firestore, params.id]);
  const { data: car, isLoading } = useDoc<Car>(carRef);

  if (isLoading) {
    return <CarDetailSkeleton />;
  }

  if (!car) {
    notFound();
  }

  const placeholder = findPlaceholderImage(car.id);
  const carType = car.type as keyof (typeof translations.type);

  const carDetails = [
      { icon: Zap, label: 'Potencia', value: `${car.horsepower} HP` },
      { icon: Droplets, label: 'Combustible', value: translations.fuelType[car.fuelType as keyof typeof translations.fuelType] },
      { icon: Gauge, label: 'Kilometraje', value: `${car.mileage.toLocaleString('es-MX')} ${car.fuelType === 'Electric' ? 'km' : 'KPL'}` },
      { icon: Users, label: 'Pasajeros', value: car.passengers },
      { icon: GitMerge, label: 'Transmisión', value: translations.transmission[car.transmission as keyof typeof translations.transmission] },
      { icon: Settings, label: 'Motor', value: car.engine },
      { icon: Palette, label: 'Color', value: translations.color[car.color as keyof typeof translations.color] },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
       <Breadcrumbs items={[{ label: 'Catálogo', href: '/catalog' }, { label: `${car.brand} ${car.model}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contáctanos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">¿Te interesa este modelo? Déjanos tus datos y un asesor se pondrá en contacto contigo.</p>
                    <LeadCaptureForm interestedCars={`${car.brand} ${car.model}`} />
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <p className="text-sm text-muted-foreground">{translations.type[carType] || car.type} • {car.year}</p>
                <h1 className="text-3xl lg:text-4xl font-bold">{car.brand} {car.model}</h1>
                <p className="text-3xl font-bold text-primary">${car.price.toLocaleString('es-MX')}</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Especificaciones</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
              {carDetails.map(detail => (
                <div key={detail.label} className="flex items-center gap-3">
                  <detail.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm text-muted-foreground">{detail.label}</p>
                    <p className="font-semibold">{detail.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Características Destacadas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {car.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
