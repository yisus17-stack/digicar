
'use client';

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

export default function BrandLogos() {
    const firestore = useFirestore();
    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
    const { data: marcas, isLoading } = useCollection<Marca>(coleccionMarcas);

    if (isLoading) {
        return <BrandLogosSkeleton />;
    }

    if (!marcas || marcas.length === 0) {
        return null;
    }

    const logosToDisplay = [...marcas, ...marcas].filter(marca => marca.logoUrl);

    if (logosToDisplay.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden bg-muted py-12">
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-muted to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-muted to-transparent z-10"></div>
            <div className="flex animate-marquee whitespace-nowrap">
                {logosToDisplay.map((marca, index) => (
                    <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center w-52 h-20">
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
    );
}
