'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Car, Tag, Palette, GitMerge, Car as CarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Image from "next/image";
import type { Car as CarType, Marca } from '@/core/types';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function EsqueletoDashboard() {
    return (
        <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-6 w-6" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-1/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle><Skeleton className="h-6 w-32" /></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function PaginaDashboardAdmin() {
    const firestore = useFirestore();

    const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
    const { data: autos, isLoading: cargandoAutos } = useCollection<CarType>(coleccionAutos);

    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
    const { data: marcas, isLoading: cargandoMarcas } = useCollection<Marca>(coleccionMarcas);

    const coleccionColores = useMemoFirebase(() => collection(firestore, 'colores'), [firestore]);
    const { data: colores, isLoading: cargandoColores } = useCollection(coleccionColores);
    
    const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
    const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection(coleccionTransmisiones);

    const autosRecientesQuery = useMemoFirebase(() => 
        query(collection(firestore, 'autos'), limit(5)), 
        [firestore]
    );
    const { data: autosRecientes, isLoading: cargandoRecientes } = useCollection<CarType>(autosRecientesQuery);

    if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones || cargandoRecientes) {
        return <EsqueletoDashboard />;
    }

    const datosGrafico = marcas?.map(marca => ({
        name: marca.nombre,
        total: autos?.filter(auto => auto.marca === marca.nombre).length ?? 0,
    })).filter(item => item.total > 0);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total de Autos
                        </CardTitle>
                        <CarIcon className="h-4 w-4 text-muted-foreground" />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Distribución de Autos por Marca</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={datosGrafico}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Autos Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {autosRecientes?.map(auto => (
                                <div key={auto.id} className="flex items-center gap-4">
                                     <Avatar className="h-14 w-14 rounded-md">
                                        {auto.imagenUrl && <AvatarImage src={auto.imagenUrl} alt={auto.modelo} className="object-cover" />}
                                        <AvatarFallback className="rounded-md">
                                            <CarIcon className="h-6 w-6 text-muted-foreground" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{auto.marca} {auto.modelo}</p>
                                        <p className="text-sm text-muted-foreground">${auto.precio.toLocaleString('es-MX')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
