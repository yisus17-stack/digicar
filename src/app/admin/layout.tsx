'use client';
import {
  LayoutDashboard,
  Car,
  Tag,
  LogOut,
  ChevronRight,
  Search,
  Moon,
  Sun,
  Home
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
import { User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [isClosed, setIsClosed] = useState(true);

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
      <div className="flex h-16 shrink-0 items-center justify-start gap-2 border-b px-6">
        <Car className={cn('h-6 w-6', { 'mx-auto': isClosed })} />
        <span className={cn('font-bold', { 'hidden': isClosed })}>DigiCar Admin</span>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={toggleSidebar}>
            <ChevronRight className={cn("h-4 w-4 transition-transform", { 'rotate-180': !isClosed })}/>
        </Button>
      </div>
      <nav className="flex flex-col gap-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              { 'bg-muted text-primary': pathname === item.href },
              { 'justify-center': isClosed }
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className={cn({ 'hidden': isClosed })}>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 p-2">
         <Link href="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              { 'justify-center': isClosed }
            )}
          >
           <Home className="h-5 w-5" />
           <span className={cn({ 'hidden': isClosed })}>Ir al Inicio</span>
        </Link>
      </div>
    </aside>
  );
}

const AdminLayoutSkeleton = () => (
    <div className="flex min-h-screen w-full">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-card sm:flex">
            <div className="flex h-16 shrink-0 items-center justify-center border-b px-4">
                <Skeleton className="h-8 w-8" />
            </div>
            <nav className="flex flex-col gap-2 p-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </nav>
             <div className="mt-auto p-2">
                <Skeleton className="h-10 w-full" />
             </div>
        </aside>
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-20 w-full">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                 <Skeleton className="h-8 w-8 sm:hidden" />
                 <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                 </div>
            </header>
            <main className="flex-1 p-4 sm:px-6 sm:py-0">
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
    </div>
)


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión correctamente.' });
      router.push('/');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cerrar sesión. Inténtalo de nuevo.' });
    }
  };

  if (userLoading || !user) {
    return <AdminLayoutSkeleton />;
  }
  
  return (
     <SidebarProvider>
        <div className="flex min-h-screen w-full">
            <AdminSidebar />
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full transition-all duration-300 data-[closed=true]:sm:pl-20" data-closed={useContext(SidebarContext)?.isClosed}>
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                  {/* We could add a mobile sidebar trigger here */}
                  <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <User className="h-4 w-4" />
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
    </SidebarProvider>
  );
}
