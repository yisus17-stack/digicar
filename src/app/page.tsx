
import { Suspense } from 'react';
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Search, TrendingUp, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
        <section className="relative bg-background text-foreground py-20 md:py-32 overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/10 rounded-full -z-10"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-accent/10 rounded-full -z-10"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
                    Donde vas a comprar tu próximo auto.
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                    Puedes elegir el auto y los servicios adecuados para ti basándote en las opiniones auténticas y oportunas de usuarios reales.
                </p>

                <div className="max-w-2xl mx-auto">
                    <div className="relative">
                        <Input
                            type="search"
                            placeholder="Busca marca, modelo, categoría..."
                            className="h-14 text-base pl-6 pr-28 rounded-full"
                        />
                        <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6" type="submit">
                            <Search className="h-4 w-4 md:hidden" />
                            <span className='hidden md:block'>Buscar</span>
                        </Button>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Link href="#popular" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Award className="h-4 w-4" />
                            <span>Los más populares</span>
                        </Link>
                        <Link href="/catalog" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <TrendingUp className="h-4 w-4" />
                            <span>Últimos Modelos</span>
                        </Link>
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
