
import CarCatalog from '@/components/catalog/CarCatalog';
import VirtualAssistant from '@/components/assistant/VirtualAssistant';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const BrandLogos = () => (
    <div className="bg-muted">
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-around items-center gap-4 flex-wrap">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} className="grayscale opacity-60" />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} className="grayscale opacity-60" />
                <Image src="/logo.svg" alt="DigiCar" width={150} height={50}/>
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} className="grayscale opacity-60" />
            </div>
        </div>
    </div>
);


export default function Home() {
    const popularCars = cars.slice(0, 3);

    return (
        <>
            <div className="container mx-auto px-4 pt-16 pb-12 md:py-24">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Inicio &gt;</Link>
                            <div className="w-full flex justify-end">
                                <VirtualAssistant />
                            </div>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold mt-4 leading-tight">
                            <span className="whitespace-nowrap">Conduce tu historia</span> con <span className="text-primary">DigiCar</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
                            Explora una nueva aventura detrás del volante. En DigiCar, cada auto es una extensión de tu historia. Descubre el modelo que acelera tu corazón y comienza el viaje que mereces.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <Button size="lg" className="text-lg px-10 py-6">
                                Explorar
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg px-10 py-6">
                                Ver catálogo
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Image
                            src="/auto-inicio.png"
                            alt="Coche principal"
                            width={800}
                            height={600}
                            className="w-full h-auto md:mt-16"
                            priority
                        />
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
