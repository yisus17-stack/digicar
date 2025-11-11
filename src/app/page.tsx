
import { Suspense } from 'react';
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { findPlaceholderImage } from '@/lib/placeholder-images';

const BrandLogos = () => (
    <div className="bg-secondary/50">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
                <Image src="/audi-logo-white.svg" alt="Audi" width={100} height={40} />
                <Image src="/vw-logo-white.svg" alt="Volkswagen" width={60} height={60} />
                <Image src="/logo-white.png" alt="DigiCar" width={150} height={50} />
                <Image src="/kia-logo-white.svg" alt="Kia" width={80} height={40} />
            </div>
        </div>
    </div>
);


const HeroSection = () => {
    const heroCar = findPlaceholderImage('aurora-gt');

    return (
        <section className="relative bg-black text-white py-20 min-h-[75vh] flex items-center">
            <div className="absolute inset-0 overflow-hidden">
                {heroCar && (
                    <Image
                        src={heroCar.imageUrl}
                        alt="Aurora GT"
                        fill
                        className="object-cover object-right opacity-40 md:opacity-100"
                        priority
                        data-ai-hint={heroCar.imageHint}
                    />
                )}
                 <div className="absolute inset-0 bg-gradient-to-l from-black/0 via-black/80 to-black"></div>
            </div>
           
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-xl">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tighter leading-tight">
                        Músculo Digital,
                        <br />
                        Hoy y Siempre
                    </h1>
                    <p className="mt-4 text-lg text-white/80">
                        La marca DigiCar es un orgulloso patrocinador de la velocidad.
                    </p>
                     <div className="mt-8">
                        <Image src="/america-250.svg" alt="Proud Partner of America 250" width={120} height={60} />
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
            <HeroSection />
            
            <BrandLogos />

            <div id="popular" className="container mx-auto px-4 py-16">
                <div className="text-center md:text-left mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
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
