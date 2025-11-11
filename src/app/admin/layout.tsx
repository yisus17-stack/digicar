'use client';
import {
  LayoutDashboard,
  Car,
  Tag,
  ChevronRight,
  Search,
  Home,
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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cars', label: 'Autos', icon: Car },
    { href: '/admin/brands', label: 'Marcas', icon: Tag },
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
              { 'bg-primary text-primary-foreground': pathname === item.href },
              { 'justify-center': isClosed }
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn({ 'hidden': isClosed })}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className={cn("w-full justify-start", {"w-auto mx-auto": isClosed})}>
                    <Avatar className="h-8 w-8">
                        {user?.photoURL && <AvatarImage src={user.photoURL} />}
                        <AvatarFallback>{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
                    </Avatar>
                    <div className={cn("flex flex-col items-start ml-3", {'hidden': isClosed})}>
                        <span className="text-sm font-medium">{user?.displayName}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem>Mi Perfil</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

const AdminLayoutSkeleton = () => {
    // This now matches the structure and classes of the actual component to prevent hydration errors.
    const isClosed = false;
    return (
        <div className="flex min-h-screen w-full">
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
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </nav>
                 <div className="mt-auto p-4">
                     <Skeleton className="h-10 w-full" />
                 </div>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                     <Skeleton className="h-8 w-8 sm:hidden" />
                     <div className="ml-auto flex items-center gap-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                     </div>
                </header>
                <main className="flex-1 p-4 sm:px-6 sm:py-0">
                    <Skeleton className="h-64 w-full" />
                </main>
            </div>
        </div>
    );
};


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <AdminLayoutSkeleton />;
  }

  return (
     <SidebarProvider>
      <AdminLayoutWithProvider user={user}>
        {children}
      </AdminLayoutWithProvider>
    </SidebarProvider>
  );
}

function AdminLayoutWithProvider({ children, user }: { children: React.ReactNode, user: any }) {
  const { isClosed } = useSidebar();
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
                {/* We could add a mobile sidebar trigger here */}
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
