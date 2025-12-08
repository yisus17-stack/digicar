
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
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
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
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import Swal from 'sweetalert2';
import { NotificationProvider } from '@/core/contexts/NotificationContext';
import NotificationCenter from '@/features/admin/components/NotificationCenter';

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
    { href: '/admin/autos', label: 'Autos', icon: Car },
    { href: '/admin/marcas', label: 'Marcas', icon: Tag },
    { href: '/admin/colores', label: 'Colores', icon: Palette },
    { href: '/admin/transmisiones', label: 'Transmisiones', icon: GitMerge },
];


function BarraLateralAdmin() {
  const { estaCerrada, alternarBarraLateral } = usarBarraLateral();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card sm:flex transition-all duration-300 ease-in-out',
        { 'w-20': estaCerrada }
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4 lg:h-20 overflow-hidden">
        <Link href="/" className={cn('relative h-10 w-10 flex-shrink-0 flex items-center justify-center transition-all', {'h-8 w-8': estaCerrada, 'hidden': estaCerrada})}>
            <Image src="/icono-digicar.png" alt="DigiCar Icono" fill className="object-contain" draggable="false" />
        </Link>
        <div className={cn(
            'flex flex-col whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden', 
            { 'opacity-0 scale-x-0 w-0': estaCerrada, 'w-auto ml-2': !estaCerrada }
        )}>
            <span className="font-bold text-lg">DigiCar</span>
            <span className="text-xs text-muted-foreground">Panel de Admin</span>
        </div>
        <div className="ml-auto flex-shrink-0">
            <Button variant="default" size="icon" onClick={alternarBarraLateral} className="h-8 w-8">
                <ChevronRight className={cn("h-5 w-5 transition-transform", { 'rotate-180': !estaCerrada })}/>
            </Button>
        </div>
      </div>
      
      <nav className="flex-1 flex-col gap-2 p-4">
        {elementosNav.map((item) => {
           const isActive = pathname === item.href;
           return (
            <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  isActive ? 'font-semibold text-primary' : 'text-muted-foreground hover:text-foreground',
                  { 'justify-center': estaCerrada }
                )}
            >
                <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn({ 'hidden': estaCerrada })}>{item.label}</span>
                <div
                    className={cn(
                    'absolute right-0 top-0 bottom-0 w-1 rounded-l-lg',
                    isActive ? 'bg-primary' : 'bg-transparent'
                    )}
                />
            </Link>
           );
        })}
      </nav>
    </aside>
  );
}

function AdminLayoutAuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading } = useUser();
    const router = useRouter();
    const adminUid = "oDqiYNo5iIWWWu8uJWOZMdheB8n2";

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/login');
            } else if (user.uid !== adminUid) {
                 Swal.fire({
                    title: 'Acceso Denegado',
                    text: 'No tienes permisos para acceder a esta página.',
                    icon: 'error',
                    confirmButtonColor: '#595c97',
                }).then(() => {
                    router.replace('/');
                });
            }
        }
    }, [user, loading, router, adminUid]);

    if (loading || !user || user.uid !== adminUid) {
        return null;
    }

    return (
      <NotificationProvider>
        <LayoutAdminConProveedor>{children}</LayoutAdminConProveedor>
        <NotificationCenter />
      </NotificationProvider>
    );
}

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <ProveedorBarraLateral>
      <AdminLayoutAuthWrapper>
        {children}
      </AdminLayoutAuthWrapper>
    </ProveedorBarraLateral>
  );
}


function LayoutAdminConProveedor({ children }: { children: React.ReactNode }) {
  const contextoBarraLateral = useContext(ContextoBarraLateral);
  const estaCerrada = contextoBarraLateral?.estaCerrada ?? false;
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const manejarCierreSesion = async () => {
    try {
      await signOut(auth);
      Swal.fire({
        title: 'Sesión Cerrada',
        text: 'Has cerrado sesión correctamente.',
        icon: 'success',
        confirmButtonColor: '#595c97',
      });
      router.push('/');
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo cerrar sesión. Inténtalo de nuevo.',
        icon: 'error',
        confirmButtonColor: '#595c97',
      });
    }
  };
  
  return (
      <div className="relative flex min-h-screen w-full" style={{ isolation: 'isolate' }}>
          <BarraLateralAdmin />
          <div className={cn("flex flex-col gap-4 py-4 w-full transition-all duration-300 ease-in-out sm:pl-64", { 'sm:pl-20': estaCerrada })}>
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
                        <UserIcon className="h-5 w-5" />
                        <span className="sr-only">Alternar menú de usuario</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={manejarCierreSesion} className="cursor-pointer text-foreground">
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <main className="flex-1 px-4 sm:px-6">{children}</main>
          </div>
      </div>
  );
}
