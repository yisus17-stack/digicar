
'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Bell, Car, CreditCard, GitCompareArrows, Heart, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function EsqueletoPerfil() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center text-center p-6">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-48 mt-1" />
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-10 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaginaPerfil() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <EsqueletoPerfil />;
  }
  
  const menuPerfil = [
      { label: 'Mi Perfil', icon: UserIcon, href: '/perfil' },
      { label: 'Notificaciones', icon: Bell, href: '#' },
      { label: 'Seguridad', icon: Shield, href: '#' },
      { label: 'Cerrar Sesión', icon: LogOut, href: '#' },
  ]

  const simulacionesGuardadas = [
    { id: 1, car: 'Toyota Camry XSE', monthlyPayment: 8500, term: 48, date: '15 de Julio, 2024' },
    { id: 2, car: 'Ford F-150 Lariat', monthlyPayment: 15200, term: 60, date: '10 de Julio, 2024' },
  ];

  const actividadReciente = [
      { id: 1, icon: Heart, text: 'Agregaste el Porsche 911 a tus favoritos.', time: 'Hace 2 horas' },
      { id: 2, icon: GitCompareArrows, text: 'Comparaste el Honda CR-V con el Hyundai Ioniq 5.', time: 'Ayer' },
      { id: 3, icon: CreditCard, text: 'Guardaste una simulación para el Toyota Camry.', time: 'Hace 3 días' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Columna Izquierda */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center p-6">
              <Avatar className="h-24 w-24 mb-4">
                {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                <AvatarFallback className="text-3xl">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.displayName || 'Usuario'}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
          </Card>
           <Card>
            <CardContent className="p-2">
                 <nav className="flex flex-col space-y-1">
                    {menuPerfil.map((item) => (
                        <Button key={item.label} variant={item.href === '/perfil' ? 'default' : 'ghost'} className="justify-start gap-3">
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Button>
                    ))}
                 </nav>
            </CardContent>
           </Card>
        </div>

        {/* Columna Derecha */}
        <div className="lg:col-span-3">
            <Tabs defaultValue="overview">
                 <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Resumen</TabsTrigger>
                    <TabsTrigger value="settings">Configuración</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Simulaciones Guardadas</CardTitle>
                                <CardDescription>Revisa las simulaciones de financiamiento que has guardado.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                {simulacionesGuardadas.map(sim => (
                                    <li key={sim.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-background rounded-md border">
                                                <CreditCard className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{sim.car}</p>
                                                <p className="text-sm text-muted-foreground">${sim.monthlyPayment.toLocaleString()}/mes por {sim.term} meses</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{sim.date}</p>
                                    </li>
                                ))}
                                </ul>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Actividad Reciente</CardTitle>
                                 <CardDescription>Un vistazo a tus últimas acciones en DigiCar.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <ul className="space-y-5">
                                    {actividadReciente.map(item => (
                                        <li key={item.id} className="flex items-start gap-4">
                                            <div className="p-2 bg-background rounded-full border mt-1">
                                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className='text-sm'>{item.text}</p>
                                                <p className="text-xs text-muted-foreground">{item.time}</p>
                                            </div>
                                        </li>
                                    ))}
                                 </ul>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="settings" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Configuración del Perfil</CardTitle>
                             <CardDescription>Actualiza la información de tu cuenta.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Nombre de Usuario</Label>
                                <Input defaultValue={user.displayName || ''} />
                            </div>
                             <div className="space-y-2">
                                <Label>Correo Electrónico</Label>
                                <Input defaultValue={user.email || ''} disabled />
                            </div>
                            <Button>Guardar Cambios</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
