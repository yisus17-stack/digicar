
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Search, GitCompareArrows, Landmark, LayoutGrid } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useState, type MouseEvent } from 'react';
import PopularCarsSection, { PopularCarsSkeleton } from '@/features/catalog/components/PopularCarsSection';
import BrandLogos, { BrandLogosSkeleton } from '@/features/catalog/components/BrandLogos';
import { useUser } from '@/firebase';


const EsqueletoSeccionHero = () => {
    return (
        <section className="relative bg-background text-foreground py-20 md:py-32 overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/10 rounded-full -z-10"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-accent/10 rounded-full -z-10"></div>
            <div className="container mx-auto px-4 text-center relative z-10">
                <Skeleton className="h-12 md:h-16 w-3/4 mx-auto mb-6" />
                <Skeleton className="h-6 md:h-7 w-full max-w-3xl mx-auto mb-10" />
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-14 w-full rounded-full" />
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                </div>
            </div>
        </section>
    );
};


const SeccionHero = () => {
    const router = useRouter();
    const { user, loading: loadingUser } = useUser();
    const [terminoBusqueda, setTerminoBusqueda] = useState('');

    const manejarBusqueda = (e: React.FormEvent) => {
        e.preventDefault();
        if (terminoBusqueda.trim()) {
            router.push(`/catalogo?search=${encodeURIComponent(terminoBusqueda.trim())}`);
        }
    };
    
    const handleProtectedLinkClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (loadingUser) {
            e.preventDefault();
            return;
        }
        if (!user) {
            e.preventDefault();
            router.push('/login');
        }
    }

    // Aunque este componente no use datos, el hook useUser lo hará suspenderse
    // si la autenticación aún está cargando, sincronizándolo con los demás.
    if (loadingUser) {
      return null;
    }


    return (
        <section className="relative bg-background text-foreground py-20 md:py-32 overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary/10 rounded-full -z-10"></div>
            <div className="absolute bottom-[-80px] right-[-80px] w-72 h-72 bg-accent/10 rounded-full -z-10"></div>

            <div className="container mx-auto px-4 text-center relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">
                    Encuentra el auto de tus sueños, sin complicaciones.
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
                    Explora, compara y financia tu próximo vehículo con nuestras herramientas inteligentes. Tu viaje empieza aquí.
                </p>

                <div className="max-w-2xl mx-auto">
                    <form onSubmit={manejarBusqueda} className="relative">
                        <Input
                            type="search"
                            placeholder="Busca marca, modelo, categoría..."
                            className="h-14 text-base pl-6 pr-28 rounded-full"
                            value={terminoBusqueda}
                            onChange={(e) => setTerminoBusqueda(e.target.value)}
                        />
                        <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-full px-6" type="submit">
                            <Search className="h-4 w-4 md:hidden" />
                            <span className='hidden md:block'>Buscar</span>
                        </Button>
                    </form>

                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <Link href="/catalogo" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <LayoutGrid className="h-4 w-4" />
                            <span>Catálogo</span>
                        </Link>
                         <Link href="/comparacion" onClick={(e) => handleProtectedLinkClick(e, '/comparacion')} className="flex items-center gap-2 hover:text-primary transition-colors">
                            <GitCompareArrows className="h-4 w-4" />
                            <span>Comparar</span>
                        </Link>
                         <Link href="/financiamiento" onClick={(e) => handleProtectedLinkClick(e, '/financiamiento')} className="flex items-center gap-2 hover:text-primary transition-colors">
                            <Landmark className="h-4 w-4" />
                            <span>Financiamiento</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function Home() {
    return (
        <Suspense fallback={
            <>
                <EsqueletoSeccionHero />
                <BrandLogosSkeleton />
                <div id="popular" className="py-24">
                    <PopularCarsSkeleton />
                </div>
            </>
        }>
            <SeccionHero />
            <BrandLogos />
            <div id="popular" className="py-24">
                <PopularCarsSection />
            </div>
        </Suspense>
    );
}
