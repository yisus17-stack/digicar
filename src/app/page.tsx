
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} />
                <Image src="/logo.png" alt="DigiCar" width={150} height={50}/>
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} />
            </div>
        </div>
    </div>
);


export default function Home() {
    const popularCars = cars.slice(0, 3);

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 overflow-x-hidden">
                <div className="flex justify-between items-center mb-8 text-base font-medium">
                    <div>
                        <span className="font-semibold text-primary">Inicio</span>
                    </div>
                    <VirtualAssistant />
                </div>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 leading-tight">
                            <span>Conduce tu historia</span> con <span className="text-primary">DigiCar</span>
                        </h1>
                        <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
                            Explora una nueva aventura detrás del volante. En DigiCar, cada auto es una extensión de tu historia. Descubre el modelo que acelera tu corazón y comienza el viaje que mereces.
                        </p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Button size="sm" className="text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6">
                                Explorar
                            </Button>
                            <Button size="sm" variant="outline" className="text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-6">
                                Ver catálogo
                            </Button>
                        </div>
                    </div>
                    <div className="mt-8 md:mt-0">
                        <Image
                            src="/auto-inicio.png"
                            alt="Coche principal"
                            width={800}
                            height={600}
                            className="w-full h-auto scale-90 sm:scale-100 md:scale-105"
                            priority
                        />
                    </div>
                </div>
            </div>
            
            <BrandLogos />

            <div id="popular" className="container mx-auto px-4 py-16">
                <div className="text-center md:text-left mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center md:text-left">
                        Los autos más populares
                    </h2>
                </div>
                <CarCatalog cars={popularCars} />
            </div>
            
            <div className="text-center mb-16 px-4">
              <Button asChild variant="outline">
                <Link href="/">
                  Ver todos los vehículos <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
        </>
    );
}
