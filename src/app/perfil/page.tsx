
'use client';

import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Repeat, CreditCard, User as UserIcon, Shield, List, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import { updateProfile } from 'firebase/auth';
import { cn } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Swal from 'sweetalert2';
import { doc, collection, updateDoc, arrayRemove } from 'firebase/firestore';
import type { Favorite, Car } from '@/core/types';
import CarCard from '@/features/catalog/components/CarCard';

const profileSchema = z.object({
  displayName: z.string(),
}).superRefine((data, ctx) => {
    if (data.displayName.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre es requerido.',
        path: ['displayName'],
      });
    } else {
      const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]+$/;
      if (!nameRegex.test(data.displayName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre solo puede contener letras y espacios.',
          path: ['displayName'],
        });
      } else {
        const words = data.displayName.trim().split(/\s+/);
        if (words.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Por favor, introduce tu nombre y al menos un apellido.',
            path: ['displayName'],
          });
        } else {
          for (const word of words) {
            if (word.length < 3) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Cada nombre y apellido debe tener al menos 3 caracteres.',
                path: ['displayName'],
              });
              break; 
            }
          }
        }
      }
    }
});

type ProfileFormData = z.infer<typeof profileSchema>;


function EsqueletoPerfil() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
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
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-8 w-48 mb-4" /></CardHeader>
            <CardContent><Skeleton className="h-48 w-full" /></CardContent>
          </Card>
           <Card>
            <CardHeader><Skeleton className="h-8 w-48 mb-4" /></CardHeader>
            <CardContent><Skeleton className="h-24 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PaginaPerfil() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const adminUid = "oDqiYNo5iIWWWu8uJWOZMdheB8n2";

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: {
      displayName: '',
    },
  });

  const refFavoritos = useMemoFirebase(() => user ? doc(firestore, 'favoritos', user.uid) : null, [user, firestore]);
  const { data: favoritos, isLoading: cargandoFavoritos } = useDoc<Favorite>(refFavoritos);

  const coleccionAutos = useMemoFirebase(() => collection(firestore, 'autos'), [firestore]);
  const { data: todosLosAutos, isLoading: cargandoTodosLosAutos } = useCollection<Car>(coleccionAutos);

  const autosFavoritos = useMemo(() => {
    if (!favoritos || !todosLosAutos) return [];
    return todosLosAutos.filter(auto => favoritos.carIds.includes(auto.id));
  }, [favoritos, todosLosAutos]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      form.setValue('displayName', user.displayName || '');
      setIsUserAdmin(user.uid === adminUid);
    }
  }, [user, loading, router, form, adminUid]);


  if (loading || !user || cargandoFavoritos || cargandoTodosLosAutos) {
    return <EsqueletoPerfil />;
  }
  
  const handleRemoveFavorite = async (carId: string) => {
    if (!refFavoritos) return;
    await updateDoc(refFavoritos, {
      carIds: arrayRemove(carId)
    });
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile(user, { displayName: data.displayName });
      Swal.fire({
        title: 'Perfil Actualizado',
        text: 'Tu nombre se ha actualizado correctamente.',
        icon: 'success',
        confirmButtonColor: '#595c97',
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar tu nombre.',
        icon: 'error',
        confirmButtonColor: '#595c97',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: List },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'settings', label: 'Configuración', icon: UserIcon },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  const actividadReciente = [
    { icon: Heart, text: 'Agregaste un Toyota Camry a favoritos.', time: 'hace 5 minutos' },
    { icon: Repeat, text: 'Comparaste un Honda CR-V y un Ford F-150.', time: 'hace 1 hora' },
    { icon: CreditCard, text: 'Guardaste una simulación de financiamiento.', time: 'hace 3 horas' },
  ];

  const simulacionesGuardadas = [
    { name: "Plan Camry XSE", date: "Guardado el 2023-11-15", payment: "$8,500 MXN/mes" },
    { name: "Plan Model 3 LR", date: "Guardado el 2023-11-10", payment: "$12,300 MXN/mes" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={[{ label: "Mi Perfil" }]} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12 items-start mt-8">
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
                      'w-full flex items-center gap-3 px-3 py-2 text-base transition-colors relative',
                      activeTab === item.id
                        ? 'font-semibold text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute left-0 top-0 bottom-0 w-1 rounded-r-lg',
                        activeTab === item.id ? 'bg-primary' : 'bg-transparent'
                      )}
                    />
                    <item.icon className={cn('h-5 w-5', activeTab === item.id ? 'text-primary' : 'text-muted-foreground')} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            <main className="lg:col-span-3">
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Actividad Reciente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {actividadReciente.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="bg-muted p-3 rounded-full">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p>{item.text}</p>
                                        <p className="text-sm text-muted-foreground">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                         <CardHeader>
                            <CardTitle className="text-xl">Simulaciones Guardadas</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            {simulacionesGuardadas.map((item, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-muted p-3 rounded-full">
                                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.date}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-muted-foreground">{item.payment}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
            {activeTab === 'favorites' && (
              <Card>
                <CardHeader>
                  <CardTitle>Mis Favoritos</CardTitle>
                  <CardDescription>Los vehículos que has guardado.</CardDescription>
                </CardHeader>
                <CardContent>
                  {autosFavoritos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {autosFavoritos.map(car => (
                        <div key={car.id} className="relative group">
                           <CarCard car={car} />
                           <Button 
                             variant="destructive" 
                             size="icon" 
                             className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => handleRemoveFavorite(car.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">No tienes favoritos</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Explora nuestro catálogo y guarda los autos que te interesen.
                      </p>
                      <Button asChild className="mt-4">
                        <a href="/catalogo">Ir al Catálogo</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                    <CardTitle>Configuración de Perfil</CardTitle>
                    <CardDescription>Actualiza la información de tu cuenta.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre de Usuario</FormLabel>
                            <FormControl>
                               <Input id="displayName" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                          <Label>Correo Electrónico</Label>
                          <Input defaultValue={user.email || ''} disabled className="mt-2" />
                      </div>
                      
                      <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isSaving}>
                              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Guardar Cambios
                            </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                      <CardTitle>Seguridad</CardTitle>
                      <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <ChangePasswordForm />
                  </CardContent>
                </Card>
              </div>
            )}
            </main>
        </div>
    </div>
  );
}
