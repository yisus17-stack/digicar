
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
    
    if (!featuredCar) {
        return (
            <section className="relative bg-background text-foreground py-20 min-h-[60vh] flex items-center justify-center text-center overflow-hidden">
                <p>Auto no encontrado</p>
            </section>
        );
    }
    
    return (
        <section className="w-full min-h-[80vh] flex bg-background text-foreground relative overflow-hidden">
            {/* Left Color Panel */}
            <div className="w-[60%] bg-primary absolute inset-y-0 left-0"></div>

            {/* Right White Panel */}
            <div className="w-[40%] bg-background absolute inset-y-0 right-0"></div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
                {/* Content Container */}
                <div className="grid grid-cols-10 w-full h-full">

                    {/* === LEFT SIDE CONTENT === */}
                    <div className="col-span-6 flex flex-col justify-between text-primary-foreground py-16 h-full">
                        {/* Top Text */}
                        <div className='pl-8 md:pl-24'>
                            <h3 className="text-4xl md:text-5xl font-bold">{featuredCar.model} {featuredCar.year}</h3>
                            <p className="mt-2 text-base md:text-lg opacity-90">{featuredCar.engine}</p>
                        </div>

                        {/* Vertical Text */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center -rotate-90 origin-bottom-left">
                            <h2 className="text-6xl md:text-8xl font-bold tracking-[0.2em] opacity-80 whitespace-nowrap text-primary-foreground/50">DIGICAR</h2>
                        </div>

                        {/* This is a spacer div, content is in the right side */}
                        <div></div> 
                    </div>

                    {/* === RIGHT SIDE CONTENT === */}
                    <div className="col-span-4 flex flex-col justify-between py-16 h-full">
                         {/* Price */}
                         <div className="text-left">
                            <p className="text-4xl md:text-5xl font-bold">${featuredCar.price.toLocaleString('es-MX')}</p>
                            <p className="text-muted-foreground text-sm mt-1">Aplican restricciones</p>
                        </div>

                        {/* Vertical Nav */}
                        <div className="my-12">
                            <ul className="space-y-4 text-left">
                                {navCars.map((car, index) => (
                                    <li key={car.id}>
                                        <Link href={`/car/${car.id}`} className="group flex items-center justify-start gap-4 text-muted-foreground hover:text-foreground transition-colors">
                                            {car.id === featuredCar.id && (
                                                <div className="w-8 h-px bg-primary"></div>
                                            )}
                                            <span className={`text-xs font-mono ${car.id === featuredCar.id ? 'text-primary font-bold' : ''}`}>
                                                {`00${index + 1}`}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {/* Social Icons */}
                        <div className="flex justify-start items-center gap-4 mt-auto">
                            <Link href="#" className="text-muted-foreground hover:text-foreground"><Facebook size={20} /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground"><Twitter size={20} /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground"><Instagram size={20} /></Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground"><Youtube size={20} /></Link>
                        </div>
                    </div>
                </div>

                {/* === CAR IMAGE (Overlapping) === */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="relative w-full h-full">
                        <Image
                            src="/auto-inicio.png"
                            alt={`${featuredCar.brand} ${featuredCar.model}`}
                            fill
                            className="object-contain"
                            priority
                        />
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
