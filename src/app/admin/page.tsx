
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Tag, Palette, GitMerge, Users as UsersIcon, Car as CarIcon, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { Car as CarType, Marca, UserProfile } from '@/core/types';

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
                            <Skeleton className="h-4 w-3/4 mt-2" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
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
    const { data: colores, isLoading: cargandoColores } = useCollection(coleccionColores);
    
    const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
    const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection(coleccionTransmisiones);
    
    const refContadorUsuarios = useMemoFirebase(() => doc(firestore, 'contadores', 'usuarios'), [firestore]);
    const { data: contadorUsuarios, isLoading: cargandoContador } = useDoc<ContadorUsuarios>(refContadorUsuarios);

    if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones || cargandoContador) {
        return <EsqueletoDashboard />;
    }

    const datosGrafico = marcas?.map(marca => ({
        name: marca.nombre,
        total: autos?.filter(auto => auto.marca === marca.nombre).length ?? 0,
    })).filter(item => item.total > 0);
    
    // Simulación de datos para la gráfica de usuarios
    const datosUsuarios = [
        { month: 'Ene', users: Math.max(0, (contadorUsuarios?.total ?? 0) - 15) },
        { month: 'Feb', users: Math.max(0, (contadorUsuarios?.total ?? 0) - 12) },
        { month: 'Mar', users: Math.max(0, (contadorUsuarios?.total ?? 0) - 10) },
        { month: 'Abr', users: Math.max(0, (contadorUsuarios?.total ?? 0) - 7) },
        { month: 'May', users: Math.max(0, (contadorUsuarios?.total ?? 0) - 3) },
        { month: 'Jun', users: contadorUsuarios?.total ?? 0 },
    ];
    
    const statCards = [
        { title: "Total de Autos", value: autos?.length ?? 0, icon: CarIcon, change: "+5.2%", description: "desde el mes pasado" },
        { title: "Total de Marcas", value: marcas?.length ?? 0, icon: Tag, change: "+2", description: "nuevas marcas" },
        { title: "Total de Colores", value: colores?.length ?? 0, icon: Palette, change: "Estable", description: "sin cambios recientes" },
        { title: "Total de Transmisiones", value: transmisiones?.length ?? 0, icon: GitMerge, change: "+1", description: "nuevo tipo añadido" },
    ];


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                     <Card key={card.title} className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 rounded-full bg-primary/10 transition-transform duration-500 group-hover:scale-[15]"></div>
                        <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            </div>
                            <card.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold">
                                {card.value}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-emerald-500 font-semibold">{card.change}</span> {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Crecimiento de Usuarios</CardTitle>
                        <CardDescription>Total de usuarios registrados en la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-center">
                         <div className="text-4xl font-bold">
                            {contadorUsuarios?.total ?? 0}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center">
                            <ArrowUpRight className="h-4 w-4 text-emerald-500 mr-1" />
                            <span className="text-emerald-500 font-semibold">+12%</span>
                            &nbsp;este mes
                        </p>
                        <div className="h-40 mt-4 -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={datosUsuarios}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)"
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))" }}
                                    />
                                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

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
