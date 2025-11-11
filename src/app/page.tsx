

import { Suspense } from 'react';
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { findPlaceholderImage } from '@/lib/placeholder-images';

const BrandLogos = () => (
    <div className="bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} className="opacity-60" />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} className="opacity-60" />
                <Image src="/logo.svg" alt="DigiCar" width={150} height={50} className="opacity-80" />
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} className="opacity-60" />
            </div>
        </div>
    </div>
);


const HeroSection = () => {
    return (
        <section className="relative bg-background text-foreground py-20 min-h-[60vh] flex items-center justify-center text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-background z-0"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-foreground">
                        Conduce tu historia con <span className="text-primary">DigiCar</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                       Explora una nueva aventura detrás del volante. En DigiCar, cada auto es una extensión de tu historia. Descubre el modelo que acelera tu corazón y comienza el viaje que mereces.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" asChild>
                            <Link href="/catalog">Explorar Catálogo</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href="/simulator">Simulador IA</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default function Home() {
    const popularCars = cars.slice(0, 3);

    return (
        <>
            <Suspense fallback={<div className="min-h-[60vh] bg-background"></div>}>
              <HeroSection />
            </Suspense>
            
            <BrandLogos />

            <div id="popular" className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
                    <p className="mt-2 text-muted-foreground">Una selección de nuestros vehículos más deseados.</p>
                </div>
                <CarCatalog cars={popularCars} />
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
