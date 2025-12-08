
import { Suspense } from 'react';
import BrandLogos, { BrandLogosSkeleton } from '@/features/catalog/components/BrandLogos';
import PopularCarsSection, { PopularCarsSkeleton } from '@/features/catalog/components/PopularCarsSection';
import { SeccionHero, EsqueletoSeccionHero } from '@/features/home/components/SeccionHero';

export default function Home() {
    return (
        <>
            <SeccionHero />
            <BrandLogos />
            <div id="popular" className="py-24">
                <Suspense fallback={<PopularCarsSkeleton />}>
                    <PopularCarsSection />
                </Suspense>
            </div>
        </>
    );
}
