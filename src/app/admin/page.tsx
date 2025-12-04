
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Tag, Palette, GitMerge, Users as UsersIcon, Car as CarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Car as CarType, Marca, Color, Transmision } from '@/core/types';

type ContadorUsuarios = {
    total: number;
}

function EsqueletoDashboard() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 grid grid-cols-1 gap-6 auto-rows-min">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-12" />
                        </CardContent>
                    </Card>
                </div>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
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
    const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);
    
    const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
    const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);
    
    const refContadorUsuarios = useMemoFirebase(() => doc(firestore, 'contadores', 'usuarios'), [firestore]);
    const { data: contadorUsuarios, isLoading: cargandoContador } = useDoc<ContadorUsuarios>(refContadorUsuarios);

    if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones || cargandoContador) {
        return <EsqueletoDashboard />;
    }

    const datosGrafico = marcas?.map(marca => ({
        name: marca.nombre,
        total: autos?.filter(auto => auto.marca === marca.nombre).length ?? 0,
    })).filter(item => item.total > 0);
    
    const statCards = [
        { title: "Total de Autos", value: autos?.length ?? 0, icon: CarIcon },
        { title: "Total de Marcas", value: marcas?.length ?? 0, icon: Tag },
        { title: "Total de Colores", value: colores?.length ?? 0, icon: Palette },
        { title: "Total de Transmisiones", value: transmisiones?.length ?? 0, icon: GitMerge },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                     <Card key={card.title}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            </div>
                            <card.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">
                                {card.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 grid grid-cols-1 gap-6 auto-rows-min">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">Total de Usuarios</CardTitle>
                            </div>
                            <UsersIcon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">
                                {contadorUsuarios?.total ?? 0}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Distribución de Autos por Marca</CardTitle>
                        <CardDescription>Visualiza la cantidad de vehículos por cada marca disponible.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={datosGrafico}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        background: "hsl(var(--background))",
                                        borderColor: "hsl(var(--border))",
                                        borderRadius: "var(--radius)"
                                    }}
                                    labelStyle={{ color: "hsl(var(--foreground))" }}
                                />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
