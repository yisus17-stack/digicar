'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
    <div className="min-h-screen bg-muted/40">
        <div className="container mx-auto px-4 py-8">
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
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-base transition-colors relative',
                        activeTab !== item.id && 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                    >
                        {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>}
                        <item.icon className={cn("mr-3 h-5 w-5", activeTab === item.id ? 'text-primary' : '')} />
                        <span className={cn(activeTab === item.id ? 'text-primary font-semibold' : '')}>{item.label}</span>
                    </button>
                    ))}
                </nav>
                </aside>

                {/* Columna Derecha - Contenido */}
                <main className="lg:col-span-3">
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Actividad Reciente</h2>
                            <div className="relative pl-6">
                                <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border"></div>
                                <ul className="space-y-8">
                                    {actividadReciente.map((item, index) => (
                                        <li key={index} className="flex items-start gap-4">
                                            <div className="bg-background border-2 border-border p-2 rounded-full z-10">
                                                <item.icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p>{item.text}</p>
                                                <p className="text-sm text-muted-foreground">{item.time}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Simulaciones Guardadas</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {simulacionesGuardadas.map((item, index) => (
                                    <Card key={index} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                                            <CardTitle className="text-base font-medium">{item.name}</CardTitle>
                                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-2xl font-bold">{item.payment}</p>
                                            <p className="text-xs text-muted-foreground">Guardado el {item.date}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'settings' && (
                    <Card>
                    <CardHeader>
                        <CardTitle>Configuración de Perfil</CardTitle>
                        <CardDescription>Actualiza la información de tu cuenta.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                        <Label htmlFor="displayName">Nombre de Usuario</Label>
                        <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                        <Label>Correo Electrónico</Label>
                        <Input defaultValue={user.email || ''} disabled />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleProfileUpdate} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                        </Button>
                    </CardFooter>
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
    </div>
  );
}
