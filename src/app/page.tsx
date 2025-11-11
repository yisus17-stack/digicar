
import { Suspense } from 'react';
import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Loader } from 'lucide-react';
import { generateHeroVideo } from '@/ai/flows/generate-hero-video';


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

const HeroContent = () => (
    <div className="relative z-10 p-4 text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter drop-shadow-lg animate-fade-in-up">
            Encuentra Tu Próximo Auto
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-white/90 drop-shadow-md animate-fade-in-up animation-delay-300">
            Explora, compara y financia el auto de tus sueños con nuestra plataforma digital.
        </p>
        <Button asChild size="lg" className="mt-8 animate-fade-in-up animation-delay-600">
            <Link href="/catalog">Explorar Catálogo</Link>
        </Button>
    </div>
);

const VideoLoadingState = () => (
     <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white z-20">
        <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground animate-pulse">Generando experiencia...</p>
    </div>
);

const HeroSection = async () => {
    const videoUrl = await generateHeroVideo();

    return (
        <section className="relative h-[75vh] min-h-[500px] flex items-center justify-center overflow-hidden">
            {videoUrl ? (
                <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute z-0 min-w-full min-h-full w-auto h-auto object-cover brightness-50"
                    key={videoUrl}
                />
            ) : (
                <Image
                    src="https://picsum.photos/seed/hero-fallback/1600/900"
                    alt="Fondo de auto"
                    fill
                    className="object-cover brightness-50"
                    priority
                    data-ai-hint="sleek car dark background"
                />
            )}
            <HeroContent />
        </section>
    )
}

export default function Home() {
    const popularCars = cars.slice(0, 3);

    return (
        <>
            <Suspense fallback={<VideoLoadingState />}>
                <HeroSection />
            </Suspense>
            
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
