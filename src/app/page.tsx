
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const BrandLogos = () => (
    <div className="bg-muted">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} className="filter brightness-0" />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} className="filter brightness-0"/>
                <Image src="/logo.png" alt="DigiCar" width={150} height={50} />
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} className="filter brightness-0"/>
            </div>
        </div>
    </div>
);


export default async function Home() {
    const popularCars = cars.slice(0, 3);

    return (
        <>
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
                <Image
                    src="https://picsum.photos/seed/hero-background/1600/900"
                    alt="Mujer sonriendo en un auto nuevo"
                    fill
                    className="object-cover brightness-50"
                    priority
                    data-ai-hint="happy woman new car"
                />
                <div className="relative z-10 p-4">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter drop-shadow-md">
                        Encuentra Tu Próximo Auto
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-white/90 drop-shadow-sm">
                        Explora, compara y financia el auto de tus sueños con nuestra plataforma digital.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/catalog">Explorar Catálogo</Link>
                    </Button>
                </div>
            </section>
            
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
