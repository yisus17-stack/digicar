'use client';

import CarTable from "@/components/admin/CarTable";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useMemoFirebase } from "@/firebase";
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
    const carsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'cars'), orderBy('brand', 'asc'));
    }, [firestore]);

    const { data: allCars, isLoading, error } = useCollection<Car>(carsQuery);

    if (isLoading) {
        return <AdminCarsLoading />;
    }

    if (error) {
        // The contextual error is thrown by the useCollection hook and caught by the error boundary
        // so we don't need to display it here. We can show a generic message.
        return <div className="text-center py-12 text-destructive">Ocurrió un error al cargar los autos.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <CarTable cars={allCars || []} />
        </div>
    );
}
