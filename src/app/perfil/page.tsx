
'use client';

import { useUser, useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Repeat, User as UserIcon, Shield, Loader2, Trash2, GitCompareArrows, Activity, Landmark } from 'lucide-react';
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
import { doc, collection, updateDoc, arrayRemove, query, where, deleteDoc } from 'firebase/firestore';
import type { Favorite, Car, Comparison, Financing, CarVariant } from '@/core/types';
import CarCard from '@/features/catalog/components/CarCard';
import Image from 'next/image';
import Link from 'next/link';

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

const ComparisonItem = ({ comparison, allCars, onRemove }: { comparison: Comparison, allCars: Car[], onRemove: (id: string) => void }) => {
    const router = useRouter();

    const car1 = allCars.find(c => c.id === comparison.autoId1);
    const car2 = allCars.find(c => c.id === comparison.autoId2);

    const variant1 = car1?.variantes.find(v => v.id === comparison.varianteId1);
    const variant2 = car2?.variantes.find(v => v.id === comparison.varianteId2);

    if (!car1 || !car2 || !variant1 || !variant2) return null;

    const handleView = () => {
        const comparisonData = {
            carId1: car1.id,
            variantId1: variant1.id,
            carId2: car2.id,
            variantId2: variant2.id,
        };
        sessionStorage.setItem('comparisonData', JSON.stringify(comparisonData));
        router.push('/comparacion');
    }

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 flex flex-col items-center text-center">
                        {variant1.imagenUrl && <Image src={variant1.imagenUrl} alt={car1.modelo} width={150} height={100} className="object-contain h-24 mb-2" />}
                        <p className="font-semibold text-sm">{car1.marca} {car1.modelo}</p>
                        <p className="text-xs text-muted-foreground">{variant1.color}</p>
                    </div>
                    <GitCompareArrows className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 flex flex-col items-center text-center">
                        {variant2.imagenUrl && <Image src={variant2.imagenUrl} alt={car2.modelo} width={150} height={100} className="object-contain h-24 mb-2" />}
                        <p className="font-semibold text-sm">{car2.marca} {car2.modelo}</p>
                        <p className="text-xs text-muted-foreground">{variant2.color}</p>
                    </div>
                </div>
                 <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                        Guardado el {new Date(comparison.fechaCreacion.seconds * 1000).toLocaleDateString()}
                    </p>
                    <div>
                        <Button variant="ghost" size="sm" onClick={handleView}>Ver</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(comparison.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const FinancingItem = ({ financing, allCars, onRemove }: { financing: Financing, allCars: Car[], onRemove: (id: string) => void }) => {
    const car = allCars.find(c => c.id === financing.autoId);
    if (!car) return null;

    const variant = car.variantes.find(v => v.id === financing.varianteId);
    const carImage = variant?.imagenUrl ?? car.imagenUrl;

    return (
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    {carImage && <Image src={carImage} alt={car.modelo} fill className="object-contain rounded-md" />}
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold">{car.marca} {car.modelo}</h4>
                    <p className="text-sm text-muted-foreground">{variant?.color}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                        <div>
                            <p className="text-muted-foreground">Pago Mensual</p>
                            <p className="font-semibold">${financing.pagoMensual.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Enganche</p>
                            <p className="font-semibold">${financing.enganche.toLocaleString('es-MX')}</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Plazo</p>
                            <p className="font-semibold">{financing.plazo} meses</p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Precio del Auto</p>
                            <p className="font-semibold">${financing.precioAuto.toLocaleString('es-MX')}</p>
                        </div>
                    </div>
                </div>
                <div className="flex sm:flex-col justify-end items-center gap-2 pt-4 sm:pt-0 sm:border-l sm:pl-4">
                     <p className="text-xs text-muted-foreground sm:absolute sm:top-4 sm:right-4">
                        {new Date(financing.fechaCreacion.seconds * 1000).toLocaleDateString()}
                    </p>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(financing.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
            </CardContent>
        </Card>
    )
}


export default function PaginaPerfil() {
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState('favorites');
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

  const queryComparaciones = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'comparaciones'), where('usuarioId', '==', user.uid));
  }, [user, firestore]);
  const { data: comparaciones, isLoading: cargandoComparaciones } = useCollection<Comparison>(queryComparaciones);

  const queryFinanciamientos = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'financiamientos'), where('usuarioId', '==', user.uid));
  }, [user, firestore]);
  const { data: financiamientos, isLoading: cargandoFinanciamientos } = useCollection<Financing>(queryFinanciamientos);


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


  if (loading || !user || cargandoFavoritos || cargandoTodosLosAutos || cargandoComparaciones || cargandoFinanciamientos) {
    return <EsqueletoPerfil />;
  }
  
  const handleRemoveFavorite = async (carId: string) => {
    if (!refFavoritos) return;
    await updateDoc(refFavoritos, {
      carIds: arrayRemove(carId)
    });
  };

    const handleRemoveComparison = async (comparisonId: string) => {
        if (!user) return;
        const result = await Swal.fire({
            title: '¿Eliminar comparación?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#595c97',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(firestore, 'comparaciones', comparisonId));
            Swal.fire('Eliminada', 'Tu comparación ha sido eliminada.', 'success');
        }
    };
    
    const handleRemoveFinancing = async (financingId: string) => {
        if (!user) return;
        const result = await Swal.fire({
            title: '¿Eliminar plan de financiamiento?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#595c97',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            await deleteDoc(doc(firestore, 'financiamientos', financingId));
            Swal.fire('Eliminado', 'Tu plan de financiamiento ha sido eliminado.', 'success');
        }
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
    { id: 'favorites', label: 'Mis Favoritos', icon: Heart },
    { id: 'comparisons', label: 'Mis Comparaciones', icon: Repeat },
    { id: 'financings', label: 'Mis Financiamientos', icon: Landmark },
    { id: 'settings', label: 'Configuración', icon: UserIcon },
    { id: 'security', label: 'Seguridad', icon: Shield },
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
            {activeTab === 'favorites' && (
              <Card>
                <CardHeader>
                  <CardTitle>Mis Favoritos</CardTitle>
                  <CardDescription>Los vehículos que has guardado para ver más tarde.</CardDescription>
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
                             className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
                        <Link href="/catalogo">Ir al Catálogo</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {activeTab === 'comparisons' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Comparaciones</CardTitle>
                        <CardDescription>Revisa las comparaciones que has guardado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {comparaciones && todosLosAutos && comparaciones.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {comparaciones.map(comp => (
                                    <ComparisonItem key={comp.id} comparison={comp} allCars={todosLosAutos} onRemove={handleRemoveComparison}/>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-16">
                                <Repeat className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No tienes comparaciones guardadas</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Ve al comparador para analizar dos vehículos.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/comparacion">Ir a Comparar</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
             {activeTab === 'financings' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mis Financiamientos</CardTitle>
                        <CardDescription>Revisa los planes de financiamiento que has guardado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {financiamientos && financiamientos.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {financiamientos.map(fin => (
                                    <FinancingItem key={fin.id} financing={fin} allCars={todosLosAutos} onRemove={handleRemoveFinancing}/>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-16">
                                <Landmark className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No tienes financiamientos guardados</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Usa la calculadora para cotizar un plan y guárdalo.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/financiamiento">Ir a la Calculadora</Link>
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
    
    