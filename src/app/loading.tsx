import { EsqueletoSeccionHero } from '@/features/home/components/SeccionHero';
import { BrandLogosSkeleton } from '@/features/catalog/components/BrandLogos';
import { PopularCarsSkeleton } from '@/features/catalog/components/PopularCarsSection';
import { Skeleton } from '@/components/ui/skeleton';


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
