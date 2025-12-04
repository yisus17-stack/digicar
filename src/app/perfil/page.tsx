
'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Heart, Repeat, CreditCard } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';

function EsqueletoPerfil() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-8" />
      <Card>
        <CardHeader className="items-center text-center p-6">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-48 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full rounded-md mb-6" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaginaPerfil() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return <EsqueletoPerfil />;
  }

  const simulacionesGuardadas = [
    { id: 1, car: 'Toyota Camry XSE', monthlyPayment: 8500, term: 48, date: '15 de Julio, 2024' },
    { id: 2, car: 'Ford F-150 Lariat', monthlyPayment: 15200, term: 60, date: '10 de Julio, 2024' },
  ];

  const actividadReciente = [
      { id: 1, icon: Heart, text: 'Agregaste el Porsche 911 a tus favoritos.', time: 'Hace 2 horas' },
      { id: 2, icon: Repeat, text: 'Comparaste el Honda CR-V con el Hyundai Ioniq 5.', time: 'Ayer' },
      { id: 3, icon: CreditCard, text: 'Guardaste una simulación para el Toyota Camry.', time: 'Hace 3 días' },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="items-center text-center p-6 border-b">
            <Avatar className="h-24 w-24 mb-4">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
            <AvatarFallback className="text-3xl">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{user.displayName || 'Usuario'}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="p-2 bg-muted/50">
              <TabsList className="grid w-full grid-cols-3 mx-auto max-w-md">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="settings">Configuración</TabsTrigger>
                  <TabsTrigger value="security">Seguridad</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">
                <TabsContent value="overview">
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
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
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
                                                <item.icon className="h-4 w-4 text-muted-foreground" />
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
                <TabsContent value="settings">
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
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cambiar Contraseña</CardTitle>
                            <CardDescription>
                                Para tu seguridad, te recomendamos usar una contraseña única que no uses en otros sitios.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChangePasswordForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </div>
        </Tabs>
      </Card>
    </div>
  );
}
