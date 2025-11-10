'use client';

import CarTable from "@/components/admin/CarTable";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore } from "@/firebase";
import { Car } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function AdminCarsLoading() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-10 w-28" />
            </div>
            <div className="border rounded-lg p-4">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                            <Skeleton className="h-8 w-8" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function AdminCarsPage() {
    const firestore = useFirestore();
    const carsQuery = query(collection(firestore, 'cars'), orderBy('brand', 'asc'));

    const { data: allCars, loading, error } = useCollection<Car>(carsQuery);

    if (loading) {
        return <AdminCarsLoading />;
    }

    if (error) {
        return <div className="text-center py-12 text-destructive">Error: {error.message}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <CarTable cars={allCars || []} />
        </div>
    );
}
