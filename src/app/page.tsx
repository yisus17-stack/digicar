

import { Suspense } from 'react';
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

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
    const featuredCar = cars.find(c => c.id === 'horizon-suv');
    const navCars = cars.slice(0, 4);
    const placeholder = featuredCar ? findPlaceholderImage(featuredCar.id) : undefined;

    if (!featuredCar || !placeholder) {
        return (
            <section className="relative bg-background text-foreground py-20 min-h-[60vh] flex items-center justify-center text-center overflow-hidden">
                <p>Auto no encontrado</p>
            </section>
        );
    }
    
    return (
        <section className="w-full min-h-[80vh] flex bg-background text-foreground">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[60%_40%]">
                {/* Left side */}
                <div className="bg-primary text-primary-foreground p-8 sm:p-12 md:p-16 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 flex items-center justify-center -rotate-90">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-widest opacity-80 whitespace-nowrap">DIGICAR</h2>
                    </div>

                    <div className="relative z-10 w-full h-full flex flex-col justify-between">
                         <div>
                            <h3 className="text-4xl md:text-5xl font-bold">{featuredCar.model}</h3>
                            <p className="text-xl md:text-2xl">{featuredCar.year}</p>
                            <p className="mt-2 text-base md:text-lg opacity-90">{featuredCar.engine}</p>
                        </div>
                        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-auto lg:flex-grow flex items-center justify-center">
                            <Image
                                src={placeholder.imageUrl}
                                alt={`${featuredCar.brand} ${featuredCar.model}`}
                                fill
                                className="object-contain"
                                data-ai-hint={placeholder.imageHint}
                                priority
                            />
                        </div>
                        <div className="h-10"></div>
                    </div>
                </div>

                {/* Right side */}
                <div className="bg-background text-foreground p-8 sm:p-12 md:p-16 flex flex-col justify-between relative">
                    <div className="text-right">
                        <p className="text-4xl md:text-5xl font-bold">${featuredCar.price.toLocaleString('es-MX')}</p>
                        <p className="text-muted-foreground text-sm mt-1">Aplican restricciones</p>
                    </div>

                    <div className="my-12">
                        <ul className="space-y-4 text-right">
                            {navCars.map((car, index) => (
                                <li key={car.id}>
                                    <Link href={`/car/${car.id}`} className="group flex items-center justify-end gap-4 text-muted-foreground hover:text-foreground transition-colors">
                                        <span className={car.id === featuredCar.id ? 'text-primary font-bold' : ''}>
                                            {car.brand} {car.model}
                                        </span>
                                        <span className={`text-xs font-mono ${car.id === featuredCar.id ? 'text-primary font-bold' : ''}`}>
                                            {`00${index + 1}`}
                                        </span>
                                        {car.id === featuredCar.id && (
                                            <div className="w-8 h-px bg-primary"></div>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex justify-end items-center gap-4 mt-auto">
                        <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook size={20} /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter size={20} /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-foreground"><Instagram size={20} /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-foreground"><Youtube size={20} /></Link>
                    </div>
                </div>
            </div>
        </section>
    );
};


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
