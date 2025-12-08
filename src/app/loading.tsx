'use client';

import { BrandLogosSkeleton } from '@/features/catalog/components/BrandLogos';
import { PopularCarsSkeleton } from '@/features/catalog/components/PopularCarsSection';
import { Skeleton } from '@/components/ui/skeleton';


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


export default function Loading() {
    return (
        <>
            <EsqueletoSeccionHero />
            <BrandLogosSkeleton />
            <div id="popular" className="py-24">
                <PopularCarsSkeleton />
            </div>
        </>
    );
}