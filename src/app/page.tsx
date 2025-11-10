
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, MessageCircle } from 'lucide-react';

const BrandLogos = () => (
    <div className="bg-secondary/50">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} className="opacity-60" />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} className="opacity-60"/>
                <Image src="/logo.png" alt="DigiCar" width={150} height={50} className="opacity-60"/>
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} className="opacity-60"/>
            </div>
        </div>
    </div>
);


export default function Home() {
    const popularCars = cars.slice(0, 3);

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-28 overflow-x-hidden">
                <div className="absolute top-28 right-28">
                  <Button variant="ghost" className="text-muted-foreground">
                    <MessageCircle className="mr-2 h-4 w-4 text-primary"/> Chatbot
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-left">
                        <div className="text-sm text-muted-foreground mb-4">
                          <p>Inicio</p>
                          <p>&gt;</p>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mt-4 leading-tight">
                            <span>Conduce tu historia</span>
                            <span className="block">con <span className="text-primary">DigiCar</span></span>
                        </h1>
                        <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl">
                            Explora una nueva aventura detrás del volante. En DigiCar, cada auto es una extensión de tu historia. Descubre el modelo que acelera tu corazón y comienza el viaje que mereces.
                        </p>
                        <div className="mt-8 flex flex-row gap-4 justify-start">
                            <Button size="lg">
                                Explorar
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href="/catalog">Ver catálogo</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="mt-8 md:mt-0">
                        <Image
                            src="/auto-inicio.png"
                            alt="Coche principal"
                            width={800}
                            height={600}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
            
            <BrandLogos />

            <div id="popular" className="container mx-auto px-4 py-16">
                <div className="text-left mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-left">
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
