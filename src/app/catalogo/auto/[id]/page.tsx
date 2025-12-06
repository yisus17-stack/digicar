'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase'; // tu instancia de Firestore
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import LeadCaptureForm from '@/features/leads/components/LeadCaptureForm';
import { Droplets, GitMerge, Settings, Users, Car as IconoAuto } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colorHexMap } from '@/lib/translations';

type CarVariant = {
  id: string;
  color: string;
  imagenUrl: string;
  precio: number;
};

type Car = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  tipo: string;
  tipoCombustible: string;
  transmision: string;
  cilindrosMotor: number;
  pasajeros: number;
  caracteristicas?: string[];
  variantes?: CarVariant[];
};

function SkeletonDetalle() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-6">
        <div className="lg:col-span-2 space-y-8">
           <AspectRatio ratio={16/10} className="overflow-hidden rounded-lg shadow-md">
              <Skeleton className="w-full h-full" />
          </AspectRatio>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
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

  // Cargar el auto desde Firestore
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

  if (isLoading) return <SkeletonDetalle />;

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mt-6">
        {/* Izquierda: Imagen y especificaciones */}
        <div className="lg:col-span-2 space-y-8">
           <AspectRatio ratio={16/10} className="overflow-hidden rounded-lg shadow-md">
            {selectedVariant ? (
              <Image
                src={selectedVariant.imagenUrl}
                alt={`${auto.marca} ${auto.modelo} en color ${selectedVariant.color}`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <IconoAuto className="w-24 h-24 text-muted-foreground" />
              </div>
            )}
          </AspectRatio>

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

        {/* Derecha: Compra */}
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
                <p className="text-sm font-medium mb-2">Color: <span className="font-semibold">{selectedVariant?.color}</span></p>
                <div className="flex flex-wrap gap-2">
                  {auto.variantes?.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={cn(
                        'relative h-12 w-12 rounded-md border-2 overflow-hidden transition-all duration-200',
                        selectedVariant?.id === v.id ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border hover:border-primary/50'
                      )}
                      title={v.color}
                    >
                      <Image src={v.imagenUrl} alt={v.color} width={48} height={48} className="object-contain" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>¿Interesado?</CardTitle>
                <CardDescription>Déjanos tus datos y un asesor se pondrá en contacto contigo.</CardDescription>
              </CardHeader>
              <CardContent>
                <LeadCaptureForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
