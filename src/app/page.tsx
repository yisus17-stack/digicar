
import CarCatalog from '@/components/catalog/CarCatalog';
import VirtualAssistant from '@/components/assistant/VirtualAssistant';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { findPlaceholderImage } from '@/lib/placeholder-images';
import { ChevronRight } from 'lucide-react';

const BrandLogos = () => (
    <div className="bg-muted">
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-around items-center gap-4 flex-wrap">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} className="grayscale opacity-60" />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} className="grayscale opacity-60" />
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="DigiCar" width={40} height={40}/>
                    <span className="font-bold text-xl text-primary">DigiCar</span>
                </div>
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} className="grayscale opacity-60" />
            </div>
        </div>
    </div>
);


export default function Home() {
    const heroCarImage = findPlaceholderImage('prestige-x10');
    const popularCars = cars.slice(0, 2);

    return (
        <>
            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative text-center">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Inicio /</Link>
                        <h1 className="text-5xl md:text-7xl font-bold mt-4 leading-tight">
                            Conduce tu historia <br /> con <span className="text-primary">DigiCar</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Explora una nueva aventura detrás del volante. En DigiCar, cada auto es una extensión de tu historia. Descubre el modelo que acelera tu corazón y comienza el viaje que mereces.
                        </p>
                        <div className="mt-8 flex gap-4 justify-center">
                            <Button size="lg" asChild>
                                <Link href="/#popular">Explorar</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/">Ver catálogo</Link>
                            </Button>
                        </div>
                        <VirtualAssistant />
                    </div>
                    <div>
                        {heroCarImage && (
                            <Image
                                src={heroCarImage.imageUrl}
                                alt="Coche principal"
                                width={800}
                                height={600}
                                className="rounded-lg object-contain"
                                data-ai-hint="sedán de lujo"
                                priority
                            />
                        )}
                    </div>
                </div>
            </div>
            
            <BrandLogos />

            <div id="popular" className="container mx-auto px-4 py-16">
                <div className="text-left mb-12">
                    <h2 className="text-4xl font-bold tracking-tight">
                        Los autos más populares
                    </h2>
                </div>
                <CarCatalog cars={popularCars} />
            </div>
            
            <div className="text-center mb-16">
              <Button asChild variant="outline">
                <Link href="/">
                  Ver todos los vehículos <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
        </>
    );
}
