import { EsqueletoSeccionHero } from '@/features/home/components/SeccionHero';
import { Skeleton } from '@/components/ui/skeleton';

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

const PopularCarsSkeleton = () => (
    <div className="container mx-auto px-4">
        <div className="text-center mb-6">
            <Skeleton className="h-10 w-2/3 mx-auto" />
            <Skeleton className="h-6 w-1/3 mx-auto mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-6">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-lg bg-muted p-4" />
                    <div className="space-y-2 py-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-4 w-2/5" />
                        <Skeleton className="h-5 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);


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
