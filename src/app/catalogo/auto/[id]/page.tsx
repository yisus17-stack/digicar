'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplets, GitMerge, Settings, Users, Car as IconoAuto, Check } from 'lucide-react';
import LeadCaptureForm from '@/features/leads/components/LeadCaptureForm';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Car, CarVariant } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function EsqueletoDetalleAuto() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-3 space-y-8">
          <AspectRatio ratio={16 / 10}>
            <Skeleton className="w-full h-full rounded-lg" />
          </AspectRatio>
          <Card>
            <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-full" /></CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
                <Separator />
                <Skeleton className="h-6 w-24 mb-4" />
                <div className="flex gap-2">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <Skeleton className="h-16 w-16 rounded-md" />
                </div>
            </div>
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
    notFound();
  }

  const detallesAuto = [
    { icon: Droplets, label: 'Combustible', value: auto.tipoCombustible },
    { icon: Users, label: 'Pasajeros', value: `${auto.pasajeros} personas` },
    { icon: GitMerge, label: 'Transmisión', value: auto.transmision },
    { icon: Settings, label: 'Cilindros', value: `${auto.cilindrosMotor} cilindros` },
  ];

  const handleVariantSelect = (variant: CarVariant) => setSelectedVariant(variant);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Catálogo', href: '/catalogo' }, { label: `${auto.marca} ${auto.modelo}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 mt-6">
        
        {/* Columna Izquierda: Imagen y Detalles */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="overflow-hidden border-0 shadow-none rounded-lg">
            <AspectRatio ratio={16 / 10} className="bg-muted rounded-lg">
              {selectedVariant ? (
                <Image
                  src={selectedVariant.imagenUrl}
                  alt={`${auto.marca} ${auto.modelo} en color ${selectedVariant.color}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconoAuto className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </AspectRatio>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {detallesAuto.map(detail => (
                    <div key={detail.label} className="flex items-center gap-3">
                        <detail.icon className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-muted-foreground">{detail.label}</p>
                            <p className="font-medium">{detail.value}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
          </Card>
          
          {auto.caracteristicas && auto.caracteristicas.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Características Incluidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {auto.caracteristicas.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
                <CardTitle>Solicita más información</CardTitle>
                <CardDescription>Uno de nuestros asesores se pondrá en contacto contigo.</CardDescription>
            </CardHeader>
            <CardContent>
                <LeadCaptureForm interestedCars={`${auto.marca} ${auto.modelo}`} />
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Info Principal (Sticky) */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{auto.tipo} • {auto.anio}</p>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{auto.marca} {auto.modelo}</h1>
            </div>
            
            <p className="text-4xl font-bold text-primary">${(selectedVariant?.precio ?? 0).toLocaleString('es-MX')}</p>

            <Button size="lg" className="w-full">Solicitar Información</Button>
            
            <Separator />
            
            <div>
              <p className="text-sm font-medium mb-3">Color: <span className="font-semibold">{selectedVariant?.color}</span></p>
              <div className="flex flex-wrap gap-2">
                {auto.variantes?.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleVariantSelect(v)}
                    className={cn(
                      'h-16 w-16 rounded-md p-1 transition-all duration-200 overflow-hidden ring-offset-background',
                      selectedVariant?.id === v.id ? 'ring-2 ring-primary' : 'ring-1 ring-border'
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
