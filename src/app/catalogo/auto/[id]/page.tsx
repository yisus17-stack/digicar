'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Droplets, GitMerge, Settings, Users, Car as IconoAuto } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

function EsqueletoDetalleAuto() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <AspectRatio ratio={16 / 10}>
              <Skeleton className="w-full h-full" />
            </AspectRatio>
          </Card>
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
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
    if (auto?.variantes?.length) {
      const isSelectedVariantValid = auto.variantes.some(v => v.id === selectedVariant?.id);
      if (!selectedVariant || !isSelectedVariantValid) {
        setSelectedVariant(auto.variantes[0]);
      }
    } else {
        setSelectedVariant(null);
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
    { icon: Users, label: 'Pasajeros', value: auto.pasajeros },
    { icon: GitMerge, label: 'Transmisión', value: auto.transmision },
    { icon: Settings, label: 'Cilindros', value: auto.cilindrosMotor },
  ];

  const handleVariantSelect = (variant: CarVariant) => setSelectedVariant(variant);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Catálogo', href: '/catalogo' }, { label: `${auto.marca} ${auto.modelo}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-6">
        
        {/* Columna Izquierda: Imagen y Detalles */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="overflow-hidden shadow-md">
            <AspectRatio ratio={16/10}>
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

          <Card>
            <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {detallesAuto.map((detalle) => (
                      <div key={detalle.label} className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                        <detalle.icon className="h-7 w-7 text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">{detalle.label}</p>
                        <p className="font-semibold">{detalle.value}</p>
                      </div>
                    ))}
                 </div>
            </CardContent>
          </Card>
          
          {auto.caracteristicas && auto.caracteristicas.length > 0 && (
             <Card>
                <CardHeader>
                    <CardTitle>Características Incluidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 list-disc list-inside text-muted-foreground">
                        {auto.caracteristicas.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
          )}

        </div>

        {/* Columna Derecha: Compra */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="shadow-md">
              <CardHeader>
                <p className="text-sm text-muted-foreground">{auto.tipo} • {auto.anio}</p>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{auto.marca} {auto.modelo}</h1>
                <p className="text-3xl font-bold text-primary pt-2">${(selectedVariant?.precio ?? 0).toLocaleString('es-MX')}</p>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div>
                  <p className="text-sm font-medium mb-2">Color: <span className="font-semibold">{selectedVariant?.color}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {auto.variantes?.map(v => (
                       <button
                        key={v.id}
                        onClick={() => handleVariantSelect(v)}
                        className={cn(
                          'relative h-12 w-12 rounded-md border-2 overflow-hidden transition-all duration-200',
                          selectedVariant?.id === v.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border hover:border-primary/50'
                        )}
                        title={v.color}
                       >
                         <Image src={v.imagenUrl} alt={v.color} fill className="object-contain" />
                       </button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                 <Button className="w-full text-base py-6">
                    Solicitar Información
                 </Button>
              </CardFooter>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>¿Interesado?</CardTitle>
                    <CardDescription>Déjanos tus datos y un asesor se pondrá en contacto contigo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <LeadCaptureForm interestedCars={`${auto.marca} ${auto.modelo}`} />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
