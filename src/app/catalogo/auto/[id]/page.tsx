
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc, collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Droplets, GitMerge, Settings, Users, Car as IconoAuto, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Car, CarVariant, Marca } from '@/core/types';
import { Button } from '@/components/ui/button';

function SkeletonDetalle() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-6">
        <div className="space-y-4">
           <AspectRatio ratio={16/10} className="overflow-hidden rounded-lg bg-muted">
              <Skeleton className="w-full h-full" />
          </AspectRatio>
        </div>
        <div className="space-y-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function PaginaDetalleAuto() {
  const params = useParams();
  const id = params?.id as string;
  const firestore = useFirestore();

  const [auto, setAuto] = useState<Car | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<CarVariant | null>(null);
  
  const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
  const { data: marcas, isLoading: cargandoMarcas } = useCollection<Marca>(coleccionMarcas);

  useEffect(() => {
    if (!id) return;

    const fetchAuto = async () => {
      setIsLoading(true);
      try {
        const ref = doc(firestore, 'autos', id);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          const data = docSnap.data() as Car;
          setAuto(data);
          if (data.variantes && data.variantes.length > 0) {
            setSelectedVariant(data.variantes[0]);
          }
        } else {
          setAuto(null);
        }
      } catch (err) {
        console.error('Error al cargar el auto:', err);
        setAuto(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuto();
  }, [id, firestore]);
  
  const brandLogoUrl = useMemo(() => {
    if (!auto || !marcas) return null;
    const brand = marcas.find(b => b.nombre === auto.marca);
    return brand?.logoUrl || null;
  }, [auto, marcas]);

  if (isLoading || cargandoMarcas) return <SkeletonDetalle />;
  if (!auto) return notFound();

  const detallesAuto = [
    { icon: Droplets, label: 'Combustible', value: auto.tipoCombustible },
    { icon: Users, label: 'Pasajeros', value: auto.pasajeros },
    { icon: GitMerge, label: 'Transmisión', value: auto.transmision },
    { icon: Settings, label: 'Cilindros', value: auto.cilindrosMotor },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Catálogo', href: '/catalogo' }, { label: `${auto.marca} ${auto.modelo}` }]} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mt-6 lg:items-stretch">
        {/* Columna Izquierda: Galería de Imágenes */}
        <div className="space-y-4">
           <AspectRatio ratio={16/10} className="group overflow-hidden rounded-lg bg-white dark:bg-background">
            {selectedVariant ? (
              <Image
                src={selectedVariant.imagenUrl}
                alt={`${auto.marca} ${auto.modelo} en color ${selectedVariant.color}`}
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IconoAuto className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="relative">
          <div className="lg:sticky top-24 h-full">
            <Card className="h-full">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-muted-foreground">{auto.tipo} • {auto.anio}</p>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{auto.marca} {auto.modelo}</h1>
                    </div>
                    {brandLogoUrl && (
                        <div className="relative h-12 w-20 flex-shrink-0">
                            <Image 
                            src={brandLogoUrl}
                            alt={`${auto.marca} logo`}
                            fill
                            className="object-contain"
                            />
                        </div>
                    )}
                </div>

                <p className="text-3xl font-bold text-primary">${(selectedVariant?.precio ?? 0).toLocaleString('es-MX')}</p>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Color: <span className="font-semibold">{selectedVariant?.color}</span></p>
                    {auto.variantes && auto.variantes.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                        {auto.variantes.map(v => (
                        <AspectRatio 
                            key={`thumb-${v.id}`} 
                            ratio={1/1} 
                            className={cn(
                                "rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                                selectedVariant?.id === v.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                            )}
                            onClick={() => setSelectedVariant(v)}
                            >
                            <Image
                                src={v.imagenUrl}
                                alt={v.color}
                                fill
                                className="object-contain"
                            />
                        </AspectRatio>
                        ))}
                    </div>
                    )}
                </div>

                <div className="pt-4">
                    <Button variant="outline" className="w-full">
                        <Heart className="mr-2 h-4 w-4" />
                        Añadir a Favoritos
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

       {/* Secciones de Detalles Adicionales */}
       <div className="mt-12 lg:mt-16">
            <Card>
                <CardHeader>
                <CardTitle>Especificaciones</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {detallesAuto.map((d) => (
                    <div key={d.label} className="p-4 bg-muted/50 rounded-lg flex flex-col items-center justify-center">
                        <d.icon className="h-7 w-7 text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">{d.label}</p>
                        <p className="font-semibold">{d.value}</p>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>

            {auto.caracteristicas && auto.caracteristicas.length > 0 && (
                <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Características Incluidas</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 list-disc list-inside text-muted-foreground">
                    {auto.caracteristicas.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                    </ul>
                </CardContent>
                </Card>
            )}
       </div>
    </div>
  );
}
