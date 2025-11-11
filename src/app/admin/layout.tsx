'use client';
import { LayoutDashboard, Car, Tag, LogOut, PanelLeft, Settings, ShieldCheck, User, Home, Search, ChevronRight, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


const AdminLayoutSkeleton = () => (
    <div className="flex min-h-screen w-full bg-muted/40">
        {/* Sidebar Skeleton */}
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex p-4 space-y-4">
            <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-6 w-24" />
            </div>
             <Skeleton className="h-10 w-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="mt-auto space-y-2">
                 {/* Placeholders removed */}
            </div>
        </aside>
        {/* Main Content Skeleton */}
        <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-end">
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6">
                <Skeleton className="h-64 w-full" />
            </main>
        </div>
    </div>
);


function AdminSidebar() {
  const pathname = usePathname();
  const { open, toggleSidebar } = useSidebar();
  
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cars", label: "Autos", icon: Car },
    { href: "/admin/brands", label: "Marcas", icon: Tag },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/admin" className={cn("flex items-center gap-2 transition-opacity", open ? 'opacity-100' : 'opacity-0 delay-0', 'delay-200')}>
            <Avatar className="bg-primary rounded-lg">
                <AvatarFallback className="bg-transparent text-primary-foreground font-bold">DC</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
                <span className="font-semibold text-lg">DigiCar</span>
                <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
        </Link>
         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleSidebar}>
            <ChevronRight className={cn("h-5 w-5 transition-transform", !open && 'rotate-180')} />
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <div className="p-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className={cn('pl-9 transition-opacity', open ? 'opacity-100' : 'opacity-0')} />
            </div>
        </div>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{
                  children: item.label,
                  side: "right",
                  align: "center",
                }}
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  <span className={cn('transition-opacity', open ? 'opacity-100' : 'opacity-0')}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-2">
         {/* Footer content removed for a cleaner look */}
      </SidebarFooter>
    </Sidebar>
  );
}

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
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
      });
    }
  };

  if (userLoading || !user) {
    return <AdminLayoutSkeleton />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 justify-end">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                  <Link href="/">
                      <Home className="h-4 w-4" />
                      <span className="sr-only">Ir a la página principal</span>
                  </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="overflow-hidden rounded-full h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}