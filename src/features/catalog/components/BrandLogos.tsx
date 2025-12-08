
'use client';

import { Suspense } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Marca } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const BrandLogosSkeleton = () => (
    <div className="bg-muted">
        <div className="container mx-auto py-12">
            <div className="flex justify-around items-center">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-52" />
                ))}
            </div>
        </div>
    </div>
);

function BrandLogosContent() {
    const firestore = useFirestore();
    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
    const { data: marcas, isLoading } = useCollection<Marca>(coleccionMarcas);

    if (isLoading) {
        return <BrandLogosSkeleton />;
    }
    
    const logosToDisplay = marcas?.filter(marca => marca.logoUrl) ?? [];

    if (logosToDisplay.length === 0) {
        return null;
    }
    
    const renderLogos = (keyPrefix: string) => logosToDisplay.map((marca, index) => (
        <div 
          key={`${keyPrefix}-${marca.id}-${index}`} 
          className="flex-shrink-0 mx-8 flex items-center justify-center"
          style={{ width: '208px', height: '80px' }}
        >
            <div className="relative w-full h-full">
                <Image
                    src={marca.logoUrl!}
                    alt={`${marca.nombre} logo`}
                    fill
                    className="object-contain"
                    draggable="false"
                />
            </div>
        </div>
    ));

    if (logosToDisplay.length < 5) {
        return (
            <div className="bg-muted">
                <div className="container mx-auto py-12">
                    <div className="flex justify-center items-center gap-8 flex-wrap">
                        {logosToDisplay.map((marca) => (
                             <div 
                                key={`static-${marca.id}`} 
                                className="flex-shrink-0 mx-8 flex items-center justify-center"
                                style={{ width: '208px', height: '80px' }}
                             >
                                <div className="relative w-full h-full">
                                    <Image
                                        src={marca.logoUrl!}
                                        alt={`${marca.nombre} logo`}
                                        fill
                                        className="object-contain"
                                        draggable="false"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full overflow-hidden bg-muted py-12">
             <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-muted to-transparent z-10"></div>
             <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-muted to-transparent z-10"></div>
            <div className="flex whitespace-nowrap">
                <div className="flex animate-marquee">{renderLogos('primary')}</div>
                <div className="flex animate-marquee" aria-hidden="true">{renderLogos('secondary')}</div>
            </div>
        </div>
    );
}

export default function BrandLogos() {
    return (
        <Suspense fallback={<BrandLogosSkeleton />}>
            <BrandLogosContent />
        </Suspense>
    );
}
