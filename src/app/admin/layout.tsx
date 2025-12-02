
'use client';
import {
  LayoutDashboard,
  Car,
  Tag,
  ChevronRight,
  Search,
  Home,
  MoreVertical,
  Palette,
  GitMerge,
  PanelLeft,
} from 'lucide-react';
import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';


// Contexto para el estado de la barra lateral
const ContextoBarraLateral = createContext<{ estaCerrada: boolean; alternarBarraLateral: () => void } | null>(null);

const usarBarraLateral = () => {
  const contexto = useContext(ContextoBarraLateral);
  if (!contexto) {
    throw new Error('usarBarraLateral debe ser usado dentro de un ProveedorBarraLateral');
  }
  return contexto;
};

// Proveedor de la barra lateral
const ProveedorBarraLateral: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [estaCerrada, setEstaCerrada] = useState(false);

  const alternarBarraLateral = () => {
    setEstaCerrada(!estaCerrada);
  };

  return (
    <ContextoBarraLateral.Provider value={{ estaCerrada, alternarBarraLateral }}>
      {children}
    </ContextoBarraLateral.Provider>
  );
};


const elementosNav = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cars', label: 'Autos', icon: Car },
    { href: '/admin/brands', label: 'Marcas', icon: Tag },
    { href: '/admin/colors', label: 'Colores', icon: Palette },
    { href: '/admin/transmissions', label: 'Transmisiones', icon: GitMerge },
];


function BarraLateralAdmin() {
  const { estaCerrada, alternarBarraLateral } = usarBarraLateral();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const manejarCierreSesion = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cerrar sesión. Inténtalo de nuevo.' });
    }
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex transition-all duration-300',
        { 'w-20': estaCerrada }
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-start gap-4 border-b px-4 lg:h-20">
         <Avatar className={cn('h-10 w-10 transition-all', {'h-8 w-8': estaCerrada})}>
            <AvatarFallback>DC</AvatarFallback>
         </Avatar>
        <div className={cn('flex flex-col', { 'hidden': estaCerrada })}>
            <span className="font-bold text-lg">DigiCar</span>
            <span className="text-xs text-muted-foreground">Panel de Admin</span>
        </div>
        <div className="ml-auto">
            <Button variant="default" size="icon" onClick={alternarBarraLateral} className="h-8 w-8">
                <ChevronRight className={cn("h-5 w-5 transition-transform", { 'rotate-180': !estaCerrada })}/>
            </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", { 'hidden': estaCerrada })} />
             <Button variant="ghost" size="icon" className={cn('mx-auto', { 'hidden': !estaCerrada })}>
                <Search className="h-5 w-5" />
             </Button>
            <Input placeholder="Autos" className={cn("pl-9", { 'hidden': estaCerrada })} />
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 p-2">
        {elementosNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              pathname === item.href ? 'bg-primary text-primary-foreground hover:text-primary-foreground' : '',
              { 'justify-center': estaCerrada }
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn({ 'hidden': estaCerrada })}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted">
                    <div className={cn("flex flex-col items-start truncate", {'items-center': estaCerrada})}>
                        <span className="text-sm font-medium truncate">{user?.displayName || 'Usuario'}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                     <MoreVertical className="h-4 w-4 ml-auto shrink-0" />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">Mi Perfil</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={manejarCierreSesion} className="text-destructive">Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

const EsqueletoLayoutAdmin = () => {
    const estaCerrada = false;
    return (
        <div className="flex min-h-screen w-full bg-background">
            <aside className={cn('fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex transition-all duration-300', { 'w-20': estaCerrada })}>
                <div className="flex h-20 shrink-0 items-center justify-start gap-4 border-b px-4">
                     <Skeleton className={cn('h-10 w-10 transition-all rounded-full', {'h-8 w-8': estaCerrada})} />
                     <div className={cn('flex flex-col gap-1', { 'hidden': estaCerrada })}>
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-3 w-16" />
                     </div>
                     <div className="ml-auto">
                        <Skeleton className="h-8 w-8" />
                     </div>
                </div>
                <div className="p-4">
                    <Skeleton className="h-10 w-full" />
                </div>
                <nav className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </nav>
                 <div className="mt-auto border-t p-2">
                     <Skeleton className="h-12 w-full rounded-lg" />
                 </div>
            </aside>
            <div className={cn("flex flex-col sm:gap-4 sm:py-4 w-full transition-all duration-300", estaCerrada ? 'sm:pl-20' : 'sm:pl-64')}>
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                     <div className="ml-auto flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                     </div>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-0">
                    <div className="space-y-4">
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                </main>
            </div>
        </div>
    );
};


export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading: cargandoUsuario } = useUser();
  const router = useRouter();
  
  if (cargandoUsuario) {
    return <EsqueletoLayoutAdmin />;
  }

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return (
        <div className='flex items-center justify-center h-screen bg-background'>
            <div className='text-center'>
                <p className='text-lg text-muted-foreground'>Acceso denegado</p>
                <Button onClick={() => router.push('/login')} className='mt-4'>
                    Ir a Iniciar Sesión
                </Button>
            </div>
        </div>
    )
  }

  return (
     <ProveedorBarraLateral>
      <LayoutAdminConProveedor>
        {children}
      </LayoutAdminConProveedor>
    </ProveedorBarraLateral>
  );
}

function LayoutAdminConProveedor({ children }: { children: React.ReactNode }) {
  const contextoBarraLateral = useContext(ContextoBarraLateral);
  const estaCerrada = contextoBarraLateral?.estaCerrada ?? false;
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  
  const manejarCierreSesion = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cerrar sesión. Inténtalo de nuevo.' });
    }
  };
  
  return (
      <div className="flex min-h-screen w-full">
          <BarraLateralAdmin />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full transition-all duration-300 data-[closed=true]:sm:pl-20" data-closed={estaCerrada}>
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" variant="outline" className="sm:hidden">
                            <PanelLeft className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="sm:max-w-xs">
                        <SheetHeader>
                            <SheetTitle>Menú de Administración</SheetTitle>
                        </SheetHeader>
                        <nav className="grid gap-6 text-lg font-medium mt-6">
                            <Link
                                href="#"
                                className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                            >
                                <Car className="h-5 w-5 transition-all group-hover:scale-110" />
                                <span className="sr-only">DigiCar</span>
                            </Link>
                            {elementosNav.map((item) => (
                                <SheetClose key={item.href} asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                        'flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground',
                                        pathname === item.href ? 'text-foreground' : ''
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="ml-auto flex items-center gap-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                      <Home className="h-5 w-5" />
                    </Link>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                         <Avatar className="h-9 w-9">
                            {user?.photoURL && <AvatarImage src={user.photoURL} />}
                            <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Alternar menú de usuario</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/profile">Mi Perfil</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={manejarCierreSesion} className="text-destructive">Cerrar Sesión</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
          </div>
      </div>
  );
}
