'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

function EsqueletoPerfil() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-6 w-64" />
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
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="items-center">
            <EsqueletoPerfil />
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Mi Perfil' }]} />
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4">
            {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar'} />}
            <AvatarFallback className="text-3xl">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl">{user.displayName || 'Usuario'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">ID de Usuario</span>
                <span className="font-mono text-sm">{user.uid}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Correo Verificado</span>
                <span className={`font-medium ${user.emailVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.emailVerified ? 'Sí' : 'No'}
                </span>
            </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fecha de Creación</span>
                <span className="font-medium">
                    {new Date(user.metadata.creationTime!).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
