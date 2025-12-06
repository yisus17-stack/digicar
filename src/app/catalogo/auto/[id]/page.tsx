'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Droplets, GitMerge, Settings, Users, Car as IconoAuto } from 'lucide-react';
import LeadCaptureForm from '@/features/leads/components/LeadCaptureForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { colorHexMap } from '@/lib/translations';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Car, CarVariant } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

function EsqueletoDetalleAuto() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <Card>
            <AspectRatio ratio={16 / 10}>
              <Skeleton className="w-full h-full" />
            </AspectRatio>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      </div>
    </div>
  );
}

export default function PaginaDetalleAuto() {
  const params = useParams();
  const id = params?.id as string;
  const firestore = useFirestore();

  const refAuto = useMemoFirebase(() => {
    if (!id) return null;
    return doc(firestore, 'autos', id);
  }, [firestore, id]);

  const { data: auto, isLoading } = useDoc<Car>(refAuto);

  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);

  useEffect(() => {
    if (auto?.variantes?.length && (!selectedVariant || !auto.variantes.some(v => v.id === selectedVariant.id))) {
      setSelectedVariant(auto.variantes[0]);
    }
  }, [auto, selectedVariant]);

  if (isLoading || !id) {
    return <EsqueletoDetalleAuto />;
  }

  if (!auto) {
    return <p>Auto no encontrado: {id}</p>;
    // notFound(); // puedes usar esto si quieres 404
  }

  const detallesAuto = [
    { icon: Droplets, label: 'Combustible', value: auto.tipoCombustible },
    { icon: Users, label: 'Pasajeros', value: auto.pasajeros },
    { icon: GitMerge, label: 'Transmisión', value: auto.transmision },
    { icon: Settings, label: 'Cilindros', value: auto.cilindrosMotor },
  ];

  const handleVariantSelect = (variant: CarVariant) => setSelectedVariant(variant);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Catálogo', href: '/catalogo' }, { label: `${auto.marca} ${auto.modelo}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3 space-y-6">
          <Card className="overflow-hidden">
            <AspectRatio ratio={16 / 10}>
              {selectedVariant ? (
                <Image
                  src={selectedVariant.imagenUrl}
                  alt={`${auto.marca} ${auto.modelo} en color ${selectedVariant.color}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <IconoAuto className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </AspectRatio>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <p className="text-sm text-muted-foreground">{auto.tipo} • {auto.anio}</p>
              <h1 className="text-3xl lg:text-4xl font-bold">{auto.marca} {auto.modelo}</h1>
              <p className="text-3xl font-bold text-primary">${(selectedVariant?.precio ?? 0).toLocaleString('es-MX')}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">Color: <span className="font-semibold">{selectedVariant?.color}</span></p>
              <div className="flex flex-wrap gap-2">
                {auto.variantes?.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleVariantSelect(v)}
                    className={cn(
                      'h-16 w-16 rounded-md p-1 transition-all duration-200 overflow-hidden',
                      selectedVariant?.id === v.id ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border'
                    )}
                    title={v.color}
                  >
                    <Image 
                      src={v.imagenUrl} 
                      alt={v.color} 
                      width={64} 
                      height={64} 
                      className="h-full w-full object-cover rounded-sm"
                    />
                    <span className="sr-only">{v.color}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
