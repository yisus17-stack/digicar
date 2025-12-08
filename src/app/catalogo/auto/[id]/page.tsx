
'use client';

import { useState, useEffect, useMemo, type MouseEvent } from 'react';
import Image from 'next/image';
import { useParams, notFound, useRouter } from 'next/navigation';
import { doc, collection, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Droplets, GitMerge, Settings, Users, Car as IconoAuto, Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Car, CarVariant, Marca, Favorite } from '@/core/types';
import { Button } from '@/components/ui/button';
import CarCard from '@/features/catalog/components/CarCard';
import { motion, AnimatePresence } from 'framer-motion';

function SkeletonDetalle() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center text-sm mb-4">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-4 w-4 mx-1" />
        <Skeleton className="h-5 w-24" />
      </div>
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
  const { user, loading: loadingUser } = useUser();
  const router = useRouter();
  
  const refAuto = useMemoFirebase(() => doc(firestore, 'autos', id), [id, firestore]);
  const { data: auto, isLoading: cargandoAuto } = useDoc<Car>(refAuto);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  
  const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
  const { data: marcas, isLoading: cargandoMarcas } = useCollection<Marca>(coleccionMarcas);
  
  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
  const { data: todosLosAutos, isLoading: cargandoTodosLosAutos } = useCollection<Car>(coleccionAutos);

  const refFavoritos = useMemoFirebase(() => user ? doc(firestore, 'favoritos', user.uid) : null, [user, firestore]);
  const { data: favoritos, isLoading: cargandoFavoritos } = useDoc<Favorite>(refFavoritos);

  const selectedVariant = useMemo(() => {
    if (!auto || !auto.variantes) return null;
    return auto.variantes.find(v => v.id === selectedVariantId) ?? auto.variantes[0];
  }, [auto, selectedVariantId]);

  useEffect(() => {
    if (auto && auto.variantes && auto.variantes.length > 0 && !selectedVariantId) {
        // Only set default if no variant is selected, or if the selected one is no longer valid
        const currentVariantExists = auto.variantes.some(v => v.id === selectedVariantId);
        if (!currentVariantExists) {
            setSelectedVariantId(auto.variantes[0].id);
        }
    }
  }, [auto, selectedVariantId]);


  useEffect(() => {
    if (!favoritos || !favoritos.items || !selectedVariant) {
      setIsFavorite(false);
      return;
    }
    const isFav = favoritos.items.some(
      item => item.autoId === id && item.varianteId === selectedVariant.id
    );
    setIsFavorite(isFav);
  }, [favoritos, id, selectedVariant]);
  
  const brandLogoUrl = useMemo(() => {
    if (!auto || !marcas) return null;
    const brand = marcas.find(b => b.nombre === auto.marca);
    return brand?.logoUrl || null;
  }, [auto, marcas]);

  const autosRelacionados = useMemo(() => {
    if (!auto || !todosLosAutos) return [];
    return todosLosAutos
      .filter(a => a.marca === auto.marca && a.id !== auto.id)
      .slice(0, 3);
  }, [auto, todosLosAutos]);

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!refFavoritos || !selectedVariant) return;
  
    const favoriteItem = { autoId: id, varianteId: selectedVariant.id };
    setIsUpdatingFavorite(true);
  
    try {
      if (isFavorite) {
        // Remover de favoritos
        await updateDoc(refFavoritos, { items: arrayRemove(favoriteItem) });
      } else {
        // Añadir a favoritos
        if (favoritos) {
          // El documento existe, solo se actualiza el array
          await updateDoc(refFavoritos, { items: arrayUnion(favoriteItem) });
        } else {
          // El documento no existe, se crea con el item inicial
          await setDoc(refFavoritos, { items: [favoriteItem] });
        }
      }
    } catch (error) {
      console.error("Error al actualizar favoritos:", error);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };


  if (cargandoAuto || cargandoMarcas || cargandoTodosLosAutos || loadingUser || cargandoFavoritos) return <SkeletonDetalle />;
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

      <Card className="mt-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Columna Izquierda: Imagen */}
            <div className="p-4 md:p-8 lg:border-r">
                 <AspectRatio 
                    ratio={16/10} 
                    className="overflow-hidden rounded-lg bg-white dark:bg-card relative"
                >
                    <AnimatePresence mode="wait">
                      {selectedVariant ? (
                      <motion.div
                          key={selectedVariant.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="w-full h-full"
                      >
                          <Image
                              src={selectedVariant.imagenUrl}
                              alt={`${auto.marca} ${auto.modelo} en color ${selectedVariant.color}`}
                              fill
                              className="object-contain"
                              priority
                              draggable="false"
                          />
                      </motion.div>
                      ) : (
                      <div className="w-full h-full flex items-center justify-center">
                          <IconoAuto className="w-24 h-24 text-muted-foreground" />
                      </div>
                      )}
                    </AnimatePresence>
                </AspectRatio>
            </div>

            {/* Columna Derecha: Información */}
            <div className="p-4 sm:p-8 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-muted-foreground">{auto.tipo} • {auto.anio}</p>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">{auto.marca} {auto.modelo}</h1>
                    </div>
                     {brandLogoUrl && (
                        <div className="relative h-16 w-28 flex-shrink-0">
                            <Image 
                            src={brandLogoUrl}
                            alt={`${auto.marca} logo`}
                            fill
                            className="object-contain"
                            draggable="false"
                            />
                        </div>
                    )}
                </div>
                
                 <AnimatePresence mode="wait">
                    <motion.p
                        key={selectedVariant?.precio}
                        className="text-3xl font-bold text-primary"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        ${(selectedVariant?.precio ?? 0).toLocaleString('es-MX')}
                    </motion.p>
                </AnimatePresence>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Color: <span className="font-semibold">{selectedVariant?.color}</span></p>
                    {auto.variantes && auto.variantes.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                        {auto.variantes.map(v => (
                        <motion.div
                          key={`thumb-motion-${v.id}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <AspectRatio 
                              ratio={1/1} 
                              className={cn(
                                  "rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                                  selectedVariant?.id === v.id ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'
                              )}
                              onClick={() => setSelectedVariantId(v.id)}
                              >
                              <Image
                                  src={v.imagenUrl}
                                  alt={v.color}
                                  fill
                                  className="object-contain"
                                  draggable="false"
                              />
                          </AspectRatio>
                        </motion.div>
                        ))}
                    </div>
                    )}
                </div>

                <Separator />
                
                <div className="pt-4">
                    <Button variant={isFavorite ? 'default' : 'outline'} className="w-full" onClick={handleToggleFavorite} disabled={isUpdatingFavorite}>
                        {isUpdatingFavorite ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Heart className={cn("mr-2 h-4 w-4", isFavorite && "fill-current")} />
                        )}
                        {isFavorite ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                    </Button>
                </div>
            </div>
        </div>
      </Card>

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

            {autosRelacionados.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-3xl font-bold tracking-tight text-center mb-8">También te puede interesar</h2>
                    <div className="flex overflow-x-auto gap-4 pb-4 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible">
                        {autosRelacionados.map(relatedCar => (
                            <div key={relatedCar.id} className="flex-shrink-0 w-[65vw] sm:w-64 lg:w-auto">
                                <CarCard car={relatedCar} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
       </div>
    </div>
  );
}
