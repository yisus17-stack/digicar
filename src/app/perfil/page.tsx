
'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Heart, Repeat, CreditCard, User as UserIcon, Shield, List } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import { cn } from '@/lib/utils';

function EsqueletoPerfil() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="md:col-span-3 space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
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

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: List },
    { id: 'settings', label: 'Configuración de Perfil', icon: UserIcon },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Columna Izquierda - Navegación */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center gap-3 p-2">
            <Avatar className="h-12 w-12">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
              <AvatarFallback className="text-lg">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm truncate">{user.displayName || 'Usuario'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>

        {/* Columna Derecha - Contenido */}
        <div className="md:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Resumen de Actividad</h2>
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
          )}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Configuración de Perfil</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Tu Información</CardTitle>
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
            </div>
          )}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Seguridad</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar Contraseña</CardTitle>
                  <CardDescription>Para tu seguridad, te recomendamos usar una contraseña única que no uses en otros sitios.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
