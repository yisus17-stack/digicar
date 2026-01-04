
import { Skeleton } from "@/components/ui/skeleton";

export default function EsqueletoComparacion() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
            <Skeleton className="h-8 w-1/4" />
            <div className="text-center">
                <Skeleton className="h-12 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    );
};
