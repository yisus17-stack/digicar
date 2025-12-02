'use client';

import { Suspense } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Search, Award, GitCompareArrows } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Car, Marca } from '@/core/types';
import PaginaCatalogoAutos from '@/features/catalog/components/CarCatalogPage';


const EsqueletoSeccionHero = () => {
    return (
        <section className="relative bg-background text-foreground py-20 md:py-32 overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/10 rounded-full -z-10"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-accent/10 rounded-full -z-10"></div>
            <div className="container mx-auto px-4 text-center relative z-10">
                <Skeleton className="h-12 md:h-16 w-3/4 mx-auto mb-6" />
                <Skeleton className="h-6 md:h-7 w-full max-w-3xl mx-auto mb-10" />
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-14 w-full rounded-full" />
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                </div>
            </div>
        </section>
    );
};


const SeccionHero = () => {
    const router = useRouter();
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    const manejarBusqueda = (e: React.FormEvent) => {
        e.preventDefault();
        if (terminoBusqueda.trim()) {
            router.push(`/catalog?search=${encodeURIComponent(terminoBusqueda.trim())}`);
        }
    };

    return (
        <section className="relative bg-background text-foreground py-20 md:py-32 overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/10 rounded-full -z-10"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-accent/10 rounded-full -z-10"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                    Encuentra el auto de tus sueños, sin complicaciones.
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                    Explora, compara y financia tu próximo vehículo con herramientas inteligentes y recomendaciones de IA. Tu viaje empieza aquí.
                </p>

                <div className="max-w-2xl mx-auto">
                    <form onSubmit={manejarBusqueda} className="relative">
                        <Input
                            type="search"
                            placeholder="Busca marca, modelo, categoría..."
                            className="h-14 text-base pl-6 pr-28 rounded-full"
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                        <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6" type="submit">
                            <Search className="h-4 w-4 md:hidden" />
                            <span className='hidden md:block'>Buscar</span>
                        </Button>
                    </form>

                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Link href="#popular" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Award className="h-4 w-4" />
                            <span>Los más populares</span>
                        </Link>
                         <Link href="/compare" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <GitCompareArrows className="h-4 w-4" />
                            <span>Comparar</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

const EsqueletoSeccionMarcas = () => (
    <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
            <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8">Nuestras Marcas</h2>
            <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-6 md:gap-x-12">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28" />
                ))}
            </div>
        </div>
    </section>
);


const SeccionMarcas = () => {
    const firestore = useFirestore();
    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'brands'), [firestore]);
    const { data: marcas, isLoading } = useCollection<Marca>(coleccionMarcas);

    if (isLoading) {
        return <EsqueletoSeccionMarcas />;
    }

    if (!marcas || marcas.length === 0) {
        return null;
    }
    
    // Duplicar los logos para un efecto de marquesina continuo
    const marcasDuplicadas = [...marcas, ...marcas];

    return (
        <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-8">
                    Marcas que manejamos
                 </h2>
                 <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
                    <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                        {marcasDuplicadas.map((brand, index) => (
                            <Link href={`/catalog?brand=${encodeURIComponent(brand.name)}`} key={`${brand.id}-${index}`} className="group mx-8 flex-shrink-0" title={brand.name}>
                                <div className="relative h-10 w-28">
                                    {brand.logoUrl ? (
                                        <Image
                                            src={brand.logoUrl}
                                            alt={`${brand.name} logo`}
                                            fill
                                            style={{ objectFit: 'contain' }}
                                            className="opacity-60 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                                        />
                                    ) : (
                                        <span className="flex items-center justify-center h-full text-muted-foreground group-hover:text-foreground transition-colors">{brand.name}</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                 </div>
            </div>
        </section>
    );
};


export default function Home() {
    const firestore = useFirestore();
    const consultaAutosPopulares = useMemoFirebase(() => query(collection(firestore, 'cars'), limit(3)), [firestore]);
    const { data: autosPopulares, isLoading: cargandoAutosPopulares } = useCollection<Car>(consultaAutosPopulares);

    if (cargandoAutosPopulares) {
      return (
        <>
          <Suspense fallback={<EsqueletoSeccionHero />}>
            <SeccionHero />
          </Suspense>
          <Suspense fallback={<EsqueletoSeccionMarcas />}>
            <SeccionMarcas />
          </Suspense>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-6">
                <Skeleton className="h-10 w-2/3 mx-auto" />
                <Skeleton className="h-6 w-1/3 mx-auto mt-2" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </>
      )
    }

    return (
        <>
            <Suspense fallback={<EsqueletoSeccionHero />}>
              <SeccionHero />
            </Suspense>

            <Suspense fallback={<EsqueletoSeccionMarcas />}>
                <SeccionMarcas />
            </Suspense>


            <div id="popular" className="container mx-auto px-4 py-8">
                <div className="text-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
                    <p className="mt-2 text-muted-foreground">Una selección de nuestros vehículos más deseados.</p>
                </div>
                 {autosPopulares && <PaginaCatalogoAutos datosTodosLosAutos={autosPopulares} /> }
            </div>
            
            <div className="text-center mb-16 px-4">
              <Button asChild variant="outline">
                <Link href="/catalog">
                  Ver todos los vehículos <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
        </>
    );
}
