
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { Tag, Palette, GitMerge, Users, Car as CarIcon, TrendingUp, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import type { Car as CarType, Marca, Color, Transmision, UserProfile } from '@/core/types';
import { cn } from "@/lib/utils";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

type ContadorUsuarios = {
    total: number;
}

const RadialProgressChart = ({ value }: { value: number; }) => {
  const percentage = Math.min((value / 100) * 100, 100);
  const circumference = 2 * Math.PI * 45; 
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative h-32 w-32">
      <svg className="h-full w-full" viewBox="0 0 100 100">
        <circle
          className="stroke-current text-muted"
          strokeWidth="10"
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
        />
        <circle
          className="stroke-current text-primary transition-all duration-1000 ease-in-out"
          strokeWidth="10"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{value}</span>
      </div>
    </div>
  );
};


function EsqueletoDashboard() {
    return (
        <div className="space-y-6">
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
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                 <div className="lg:col-span-1 grid grid-cols-1 gap-6 auto-rows-min">
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <Skeleton className="h-32 w-32 rounded-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function PaginaDashboardAdmin() {
    const firestore = useFirestore();
    const { user, loading: cargandoUsuario } = useUser();
    
    const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
    const { data: autos, isLoading: cargandoAutos } = useCollection<CarType>(coleccionAutos);

    const coleccionMarcas = useMemoFirebase(() => collection(firestore, 'marcas'), [firestore]);
    const { data: marcas, isLoading: cargandoMarcas } = useCollection<Marca>(coleccionMarcas);

    const coleccionColores = useMemoFirebase(() => collection(firestore, 'colores'), [firestore]);
    const { data: colores, isLoading: cargandoColores } = useCollection<Color>(coleccionColores);
    
    const coleccionTransmisiones = useMemoFirebase(() => collection(firestore, 'transmisiones'), [firestore]);
    const { data: transmisiones, isLoading: cargandoTransmisiones } = useCollection<Transmision>(coleccionTransmisiones);
    
    const refContadorUsuarios = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'contadores', 'usuarios');
    }, [firestore, user]);

    const { data: contadorUsuarios, isLoading: cargandoContador } = useDoc<ContadorUsuarios>(refContadorUsuarios);
    
    if (cargandoUsuario || cargandoAutos || cargandoMarcas || cargandoColores || cargandoTransmisiones || cargandoContador) {
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
    
    const totalUsuarios = contadorUsuarios?.total ?? 0;

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((card, index) => (
                     <Card key={card.title} className="relative overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Distribución de Autos por Marca</CardTitle>
                        <CardDescription>Visualiza la cantidad de vehículos por cada marca disponible.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={datosGrafico}>
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
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
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Total de Usuarios</CardTitle>
                        <CardDescription>Usuarios registrados en la plataforma.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex items-center justify-center">
                        <RadialProgressChart value={totalUsuarios} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
