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
  Droplets,
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

// Context for Sidebar state
const SidebarContext = createContext<{ isClosed: boolean; toggleSidebar: () => void } | null>(null);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Sidebar Provider
const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClosed, setIsClosed] = useState(false);

  const toggleSidebar = () => {
    setIsClosed(!isClosed);
  };

  return (
    <SidebarContext.Provider value={{ isClosed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};


function AdminSidebar() {
  const { isClosed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cerrar sesión. Inténtalo de nuevo.' });
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cars', label: 'Autos', icon: Car },
    { href: '/admin/brands', label: 'Marcas', icon: Tag },
    { href: '/admin/colors', label: 'Colores', icon: Palette },
    { href: '/admin/transmissions', label: 'Transmisiones', icon: GitMerge },
    { href: '/admin/fuels', label: 'Combustibles', icon: Droplets },
  ];

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex transition-all duration-300',
        { 'w-20': isClosed }
      )}
    >
      <div className="flex h-20 shrink-0 items-center justify-start gap-4 border-b px-4">
         <Avatar className={cn('h-10 w-10 transition-all', {'h-8 w-8': isClosed})}>
            <AvatarFallback>DC</AvatarFallback>
         </Avatar>
        <div className={cn('flex flex-col', { 'hidden': isClosed })}>
            <span className="font-bold text-lg">DigiCar</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
        <div className="ml-auto">
            <Button variant="default" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                <ChevronRight className={cn("h-5 w-5 transition-transform", { 'rotate-180': !isClosed })}/>
            </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", { 'hidden': isClosed })} />
             <Button variant="ghost" size="icon" className={cn('mx-auto', { 'hidden': !isClosed })}>
                <Search className="h-5 w-5" />
             </Button>
            <Input placeholder="Autos" className={cn("pl-9", { 'hidden': isClosed })} />
        </div>
      </div>
      
      <nav className="flex flex-col gap-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              pathname.startsWith(item.href) && item.href !== '/admin' && pathname !== '/admin' ? 'bg-primary text-primary-foreground' : '',
              pathname === '/admin' && item.href === '/admin' ? 'bg-primary text-primary-foreground' : '',
              { 'justify-center': isClosed }
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn({ 'hidden': isClosed })}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t p-2">
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-muted">
                    <div className={cn("flex flex-col items-start truncate", {'items-center': isClosed})}>
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
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

const AdminLayoutSkeleton = () => {
    const isClosed = false;
    return (
        <div className="flex min-h-screen w-full bg-background">
            <aside className={cn('fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card sm:flex transition-all duration-300', { 'w-20': isClosed })}>
                <div className="flex h-20 shrink-0 items-center justify-start gap-4 border-b px-4">
                     <Skeleton className={cn('h-10 w-10 transition-all rounded-full', {'h-8 w-8': isClosed})} />
                     <div className={cn('flex flex-col gap-1', { 'hidden': isClosed })}>
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
            <div className={cn("flex flex-col sm:gap-4 sm:py-4 w-full transition-all duration-300", isClosed ? 'sm:pl-20' : 'sm:pl-64')}>
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


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  if (userLoading) {
    return <AdminLayoutSkeleton />;
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
     <SidebarProvider>
      <AdminLayoutWithProvider>
        {children}
      </AdminLayoutWithProvider>
    </SidebarProvider>
  );
}

function AdminLayoutWithProvider({ children }: { children: React.ReactNode }) {
  const sidebarContext = useContext(SidebarContext);
  const isClosed = sidebarContext?.isClosed ?? false;
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const handleSignOut = async () => {
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
          <AdminSidebar />
          <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full transition-all duration-300 data-[closed=true]:sm:pl-20" data-closed={isClosed}>
              <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild><Link href="/profile">Mi Perfil</Link></DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>Cerrar Sesión</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              <main className="flex-1 p-4 sm:px-6 sm:py-0">{children}</main>
          </div>
      </div>
  );
}
