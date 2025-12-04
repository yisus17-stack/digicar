
'use client';

import { useAuth, useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Heart, Repeat, CreditCard, User as UserIcon, Shield, List, Loader2, UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { deleteImage, uploadImage } from '@/core/services/storageService';


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
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        toast({ title: 'Error', description: 'Por favor, selecciona un archivo de imagen.', variant: 'destructive'});
        return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: 'Error', description: 'El archivo es demasiado grande (máximo 5MB).', variant: 'destructive'});
        return;
    }

    setUploadProgress(0); // Start progress simulation

    try {
        // Step 1: Delete the old image if it exists and it's from our storage
        if (user.photoURL && user.photoURL.includes('supabase')) {
            await deleteImage(user.photoURL);
        }

        // Step 2: Upload the new image
        const newPhotoURL = await uploadImage(file, (progress) => {
            setUploadProgress(progress);
        });

        // Step 3: Update the user's profile
        await updateProfile(user, { photoURL: newPhotoURL });

        toast({
            title: '¡Foto de perfil actualizada!',
            description: 'Tu nueva foto de perfil se ha guardado.',
        });
    } catch (error) {
        console.error("Avatar upload error: ", error);
        toast({
            title: 'Error al subir la imagen',
            description: 'No se pudo actualizar tu foto de perfil. Inténtalo de nuevo.',
            variant: 'destructive',
        });
    } finally {
        setUploadProgress(null); // End progress
    }
};

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const menuItems = [
    { id: 'overview', label: 'Resumen', icon: List },
    { id: 'settings', label: 'Configuración', icon: UserIcon },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  const summaryCards = [
    { title: 'Autos Favoritos', value: '5', icon: Heart, href: '#' },
    { title: 'Comparaciones', value: '3', icon: Repeat, href: '/compare' },
    { title: 'Simulaciones', value: '2', icon: CreditCard, href: '#' },
  ]

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4,
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
      
      <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, {user.displayName?.split(' ')[0] || 'Usuario'}!</h1>
          <p className="text-muted-foreground">Bienvenido a tu centro de control personal de DigiCar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Columna Izquierda - Navegación */}
        <aside className="lg:col-span-1 space-y-6 sticky top-24">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
                  <AvatarFallback className="text-2xl">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg truncate">{user.displayName || 'Usuario'}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start text-base py-6"
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Columna Derecha - Contenido */}
        <main className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={pageTransition}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Resumen de Actividad</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {summaryCards.map(item => (
                            <Card key={item.title} className="hover:border-primary transition-colors">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                    <item.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{item.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                  </div>
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
                      <div className="space-y-3">
                        <Label>Foto de Perfil</Label>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                {user.photoURL && <AvatarImage src={user.photoURL} />}
                                <AvatarFallback className="text-3xl">{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                             <Button asChild variant="outline">
                                <label htmlFor="avatar-upload" className="cursor-pointer">
                                  <UploadCloud className="mr-2 h-4 w-4" />
                                  Cambiar foto
                                </label>
                             </Button>
                        </div>
                        {uploadProgress !== null && (
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Subiendo...</p>
                                <Progress value={uploadProgress} className="w-full" />
                            </div>
                        )}
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
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
