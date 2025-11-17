
'use client';

import { Suspense } from 'react';
import CarCatalog from '@/components/catalog/CarCatalog';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Search, Award, GitCompareArrows, Wand2, Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Car } from '@/lib/types';


const HeroSectionSkeleton = () => {
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


const HeroSection = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
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
                    <form onSubmit={handleSearch} className="relative">
                        <Input
                            type="search"
                            placeholder="Busca marca, modelo, categoría..."
                            className="h-14 text-base pl-6 pr-28 rounded-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
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

const FeaturesSection = () => {
    const features = [
        {
            icon: Wand2,
            title: "Asesoría Inteligente",
            description: "Dinos qué necesitas y nuestra IA encontrará el auto perfecto para ti entre miles de opciones.",
            href: "/simulator"
        },
        {
            icon: GitCompareArrows,
            title: "Comparación Detallada",
            description: "Analiza hasta el último detalle. Compara modelos lado a lado y deja que la IA te ayude a decidir.",
            href: "/compare"
        },
        {
            icon: Landmark,
            title: "Financiamiento a tu Medida",
            description: "Calcula tus pagos mensuales y explora opciones de crédito de forma clara y transparente.",
            href: "/financing"
        }
    ];

    return (
        <section className="py-20 bg-muted/50">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground mb-4">
                                <feature.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground mb-4 max-w-xs">{feature.description}</p>
                            <Button variant="link" asChild>
                                <Link href={feature.href}>
                                    Saber más <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

const PopularCarsSkeleton = () => (
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
);

export default function Home() {
    const firestore = useFirestore();
    const popularCarsQuery = useMemoFirebase(() => query(collection(firestore, 'cars'), limit(3)), [firestore]);
    const { data: popularCars, isLoading: popularCarsLoading } = useCollection<Car>(popularCarsQuery);

    const [comparisonIds, setComparisonIds] = useState<string[]>([]);
    const router = useRouter();

    const handleToggleCompare = (carId: string) => {
        setComparisonIds(prevIds => {
          if (prevIds.includes(carId)) {
            return prevIds.filter(id => id !== carId);
          }
          if (prevIds.length < 2) {
            return [...prevIds, carId];
          }
          // If 2 are already selected, replace the last one
          return [...prevIds.slice(0, 1), carId];
        });
    };

    return (
        <>
            <Suspense fallback={<HeroSectionSkeleton />}>
              <HeroSection />
            </Suspense>

            <FeaturesSection />

            <div id="popular" className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
                    <p className="mt-2 text-muted-foreground">Una selección de nuestros vehículos más deseados.</p>
                </div>
                {popularCarsLoading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-64 w-full rounded-lg" />
                    </div>
                ) : (
                    <CarCatalog
                        cars={popularCars ?? []}
                        comparisonIds={comparisonIds}
                        onToggleCompare={handleToggleCompare}
                    />
                )}
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
