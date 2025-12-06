'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Marca } from '@/core/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const BrandLogosSkeleton = () => (
    <div className="py-12 bg-muted/50">
        <div className="container mx-auto">
            <div className="flex justify-around items-center">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-24" />
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

    const logosToDisplay = marcas.filter(marca => marca.logoUrl);

    if (logosToDisplay.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full overflow-hidden bg-muted/50 py-12">
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--background)) 0%, transparent 10%, transparent 90%, hsl(var(--background)) 100%)' }}></div>
            <div className="flex animate-marquee">
                {logosToDisplay.map((marca, index) => (
                    <div key={index} className="flex-shrink-0 mx-8 flex items-center justify-center w-48">
                        <div className="relative w-full h-16">
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
