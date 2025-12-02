'use client';

import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Droplets, Gauge, Users, Palette, GitMerge, Settings, Car as IconoAuto } from 'lucide-react';
import LeadCaptureForm from '@/features/leads/components/LeadCaptureForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { translations } from '@/lib/translations';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Car } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

function EsqueletoDetalleAuto() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/3" />
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle><Skeleton className="h-6 w-56" /></CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-full" />
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

export default function PaginaDetalleAuto({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const refAuto = useMemoFirebase(() => doc(firestore, 'autos', params.id), [firestore, params.id]);
  const { data: auto, isLoading } = useDoc<Car>(refAuto);

  if (isLoading) {
    return <EsqueletoDetalleAuto />;
  }

  if (!auto) {
    notFound();
  }

  const tipoAuto = auto.type as keyof (typeof translations.type);

  const detallesAuto = [
      { icon: Droplets, label: 'Combustible', value: translations.fuelType[auto.fuelType as keyof typeof translations.fuelType] },
      { icon: Users, label: 'Pasajeros', value: auto.passengers },
      { icon: GitMerge, label: 'Transmisión', value: translations.transmission[auto.transmission as keyof typeof translations.transmission] },
      { icon: Settings, label: 'Motor', value: auto.engine },
      { icon: Palette, label: 'Color', value: translations.color[auto.color as keyof typeof translations.color] },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
       <Breadcrumbs items={[{ label: 'Catálogo', href: '/catalog' }, { label: `${auto.brand} ${auto.model}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
          <Card className="overflow-hidden">
             <AspectRatio ratio={4/3}>
              {auto.imageUrl ? (
                <Image src={auto.imageUrl} alt={`${auto.brand} ${auto.model}`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <IconoAuto className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
             </AspectRatio>
          </Card>
          <Card>
              <CardHeader>
                  <CardTitle>Contáctanos</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground mb-4">¿Te interesa este modelo? Déjanos tus datos y un asesor se pondrá en contacto contigo.</p>
                  <LeadCaptureForm interestedCars={`${auto.brand} ${auto.model}`} />
              </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <p className="text-sm text-muted-foreground">{translations.type[tipoAuto] || auto.type} • {auto.year}</p>
                <h1 className="text-3xl lg:text-4xl font-bold">{auto.brand} {auto.model}</h1>
                <p className="text-3xl font-bold text-primary">${auto.price.toLocaleString('es-MX')}</p>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Especificaciones</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-6">
              {detallesAuto.map(detail => (
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
                {auto.features.map((feature, index) => (
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
