'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Car, Tag, Palette, GitMerge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function EsqueletoDashboard() {
    return (
        <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Autos</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/4" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Marcas</CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/4" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Colores</CardTitle>
                        <Palette className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/4" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Transmisiones</CardTitle>
                        <GitMerge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/4" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PaginaDashboardAdmin() {
    const firestore = useFirestore();

    const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
    const { data: autos, isLoading: cargandoAutos } = useCollection(coleccionAutos);

    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
    const { data: marcas, isLoading: cargandoMarcas } = useCollection(coleccionMarcas);

    const coleccionColores = useMemoFirebase(() => collection(firestore, 'colores'), [firestore]);
    const { data: colores, isLoading: cargandoColores } = useCollection(coleccionColores);
    
    const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
    const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection(coleccionTransmisiones);

    if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones) {
        return <EsqueletoDashboard />;
    }

    return (
        <div>
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
                            {autos?.length ?? 0}
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
                           {marcas?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Colores
                        </CardTitle>
                        <Palette className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {colores?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Transmisiones
                        </CardTitle>
                        <GitMerge className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                           {transmisiones?.length ?? 0}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
