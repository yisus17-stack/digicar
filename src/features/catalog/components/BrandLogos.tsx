
'use client';

import { Suspense, useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Marca } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export const BrandLogosSkeleton = () => (
    <div className="bg-muted">
        <div className="container mx-auto py-8 md:py-12">
            <div className="flex justify-around items-center">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-32 md:h-20 md:w-52" />
                ))}
            </div>
        </div>
    </div>
);

const LogoImage = ({ marca }: { marca: Marca }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <div className="relative w-full h-full">
            {!isLoaded && <Skeleton className="absolute inset-0" />}
            <Image
                src={marca.logoUrl!}
                alt={`${marca.nombre} logo`}
                fill
                className={cn(
                    "object-contain transition-opacity duration-300",
                    isLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setIsLoaded(true)}
                draggable="false"
            />
        </div>
    );
};


function BrandLogosContent() {
    const firestore = useFirestore();
    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
    const { data: marcas, isLoading } = useCollection<Marca>(coleccionMarcas);

    const logosToDisplay = useMemo(() => {
        const logos = marcas?.filter(marca => marca.logoUrl) ?? [];
        if (logos.length === 0) return [];
        
        // Duplicar la lista para asegurar un bucle suave
        let extendedLogos = [];
        const desiredCount = 20; // Un número suficientemente grande para el bucle
        if (logos.length > 0) {
            while (extendedLogos.length < desiredCount) {
                extendedLogos.push(...logos);
            }
        }
        return extendedLogos;
    }, [marcas]);

    if (isLoading) {
        return <BrandLogosSkeleton />;
    }
    
    if (logosToDisplay.length === 0) {
        return null;
    }
    
    const renderLogos = (logos: Marca[], keyPrefix: string) => logos.map((marca, index) => (
        <div 
          key={`${keyPrefix}-${marca.id}-${index}`} 
          className="flex-shrink-0 mx-4 md:mx-8 w-32 h-16 md:w-52 md:h-20 flex items-center justify-center"
        >
            <LogoImage marca={marca} />
        </div>
    ));

    return (
        <div className="relative w-full overflow-hidden bg-muted py-8 md:py-12">
             <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-muted to-transparent z-10"></div>
             <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-muted to-transparent z-10"></div>
            <div className="flex whitespace-nowrap">
                <div className="flex animate-marquee">{renderLogos(logosToDisplay, 'primary')}</div>
                <div className="flex animate-marquee" aria-hidden="true">{renderLogos(logosToDisplay, 'secondary')}</div>
            </div>
        </div>
    );
}

export default function BrandLogos() {
    return <BrandLogosContent />;
}
