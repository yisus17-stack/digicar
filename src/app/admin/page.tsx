
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, Timestamp } from "firebase/firestore";
import { Tag, Palette, GitMerge, Users as UsersIcon, Car as CarIcon, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import type { Car as CarType, Marca, UserProfile, Color, Transmision } from '@/core/types';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
    const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);
    
    const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
    const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);
    
    const coleccionUsuarios = useMemoFirebase(() => collection(firestore, 'usuarios'), [firestore]);
    const { data: perfilesUsuarios, isLoading: cargandoUsuarios } = useCollection<UserProfile>(coleccionUsuarios);
    
    const refContadorUsuarios = useMemoFirebase(() => doc(firestore, 'contadores', 'usuarios'), [firestore]);
    const { data: contadorUsuarios, isLoading: cargandoContador } = useDoc<ContadorUsuarios>(refContadorUsuarios);

    const datosGraficoUsuarios = useMemo(() => {
        if (!perfilesUsuarios) return [];

        const userCountsByMonth = perfilesUsuarios.reduce((acc, user) => {
            if (user.createdAt) {
                const date = user.createdAt.toDate();
                const monthKey = format(date, 'MMM yy', { locale: es });
                acc[monthKey] = (acc[monthKey] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const sortedMonths = Object.keys(userCountsByMonth).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`01 ${monthA} ${yearA}`);
            const dateB = new Date(`01 ${monthB} ${yearB}`);
            return dateA.getTime() - dateB.getTime();
        });
        
        let cumulativeUsers = 0;
        return sortedMonths.map(monthKey => {
            cumulativeUsers += userCountsByMonth[monthKey];
            return {
                month: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
                users: cumulativeUsers
            };
        });
    }, [perfilesUsuarios]);

    if (cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones || cargandoContador || cargandoUsuarios) {
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
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Crecimiento de Usuarios</CardTitle>
                        <CardDescription>Total de usuarios registrados en la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-center">
                         <div className="text-4xl font-bold">
                            {contadorUsuarios?.total ?? 0}
                        </div>
                        <div className="h-40 mt-4 -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={datosGraficoUsuarios} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 1']}/>
                                    <Tooltip
                                        contentStyle={{
                                            background: "hsl(var(--background))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)"
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))" }}
                                    />
                                    <Line type="monotone" dataKey="users" name="Usuarios" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }}/>
                                </LineChart>
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
