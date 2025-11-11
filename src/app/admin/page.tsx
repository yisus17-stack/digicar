'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Car, Tag } from "lucide-react";

export default function AdminDashboardPage() {
    const firestore = useFirestore();

    const carsCollection = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
    const { data: cars, isLoading: carsLoading } = useCollection(carsCollection);

    const brandsCollection = useMemoFirebase(() => collection(firestore, 'brands'), [firestore]);
    const { data: brands, isLoading: brandsLoading } = useCollection(brandsCollection);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Autos
                        </CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {carsLoading ? '...' : cars?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Marcas
                        </CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {brandsLoading ? '...' : brands?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
