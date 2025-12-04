'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Heart, Repeat, CreditCard, User as UserIcon, Shield, List, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
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
        </div>
      </div>
    </div>
  );
}

export default function PaginaPerfil() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <EsqueletoPerfil />;
  }

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName });
      toast({
        title: 'Perfil Actualizado',
        description: 'Tu nombre se ha actualizado correctamente.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar tu nombre.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: List },
    { id: 'settings', label: 'Configuración', icon: UserIcon },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  const actividadReciente = [
    { icon: Heart, text: 'Agregaste un Toyota Camry a favoritos.', time: 'hace 5 minutos' },
    { icon: Repeat, text: 'Comparaste un Honda CR-V y un Ford F-150.', time: 'hace 1 hora' },
    { icon: CreditCard, text: 'Guardaste una simulación de financiamiento.', time: 'hace 3 horas' },
  ];

  const simulacionesGuardadas = [
    { name: "Plan Camry XSE", date: "2023-11-15", payment: "$8,500 MXN/mes" },
    { name: "Plan Model 3 LR", date: "2023-11-10", payment: "$12,300 MXN/mes" },
  ]


  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start mt-8">
        {/* Columna Izquierda - Navegación */}
        <aside className="lg:col-span-1 space-y-8 sticky top-24">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.photoURL && !user.photoURL.includes('supabase') ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />
              ) : (
                <AvatarFallback className="text-2xl">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="font-semibold text-lg truncate">{user.displayName || 'Usuario'}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-base transition-colors',
                  activeTab === item.id
                    ? 'bg-muted text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Columna Derecha - Contenido */}
        <main className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {actividadReciente.map((item, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="bg-muted p-2 rounded-full">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p>{item.text}</p>
                                        <p className="text-sm text-muted-foreground">{item.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Simulaciones Guardadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {simulacionesGuardadas.map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <div className='flex items-center gap-3'>
                                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className='font-medium'>{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Guardado el {item.date}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-primary">{item.payment}</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
          )}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Perfil</CardTitle>
                <CardDescription>Actualiza la información de tu cuenta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-3">
                  <Label>Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                          {user.photoURL && !user.photoURL.includes('supabase') ? (
                            <AvatarImage src={user.photoURL} />
                          ) : (
                            <AvatarFallback className="text-3xl">{user.displayName?.charAt(0)}</AvatarFallback>
                          )}
                      </Avatar>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre de Usuario</Label>
                  <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input defaultValue={user.email || ''} disabled />
                </div>
              </CardContent>
              <CardContent>
                <Button onClick={handleProfileUpdate} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          )}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
                <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChangePasswordForm />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
