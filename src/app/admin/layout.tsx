'use client';
import { LayoutDashboard, Car, Tag, LogOut, PanelLeft, Settings, ShieldCheck, User } from "lucide-react";
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
} from "@/components/ui/sidebar";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";


const AdminLayoutSkeleton = () => (
    <div className="flex min-h-screen w-full bg-muted/40">
        {/* Sidebar Skeleton */}
        <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
            <div className="flex h-[60px] items-center border-b px-6">
                <Skeleton className="h-8 w-32" />
            </div>
            <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium">
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-10 w-full" />
                </nav>
            </div>
        </aside>
        {/* Main Content Skeleton */}
        <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                <Skeleton className="h-8 w-8 rounded-full sm:hidden" />
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
  const { open } = useSidebar();
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cars", label: "Autos", icon: Car },
    { href: "/admin/brands", label: "Marcas", icon: Tag },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/admin">
            <Image
              src="/logo.svg"
              alt="DigiCar Logo"
              width={120}
              height={40}
              className={cn("transition-all", open ? "opacity-100" : "opacity-0")}
            />
          </Link>
        </SidebarHeader>
        <SidebarContent>
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
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <AdminLayoutSkeleton />;
  }
  
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex flex-1 flex-col bg-muted/40">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
           <SidebarProvider>
             <SidebarTrigger className="sm:hidden" />
           </SidebarProvider>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                <Link href="/">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Ir a la página principal</span>
                </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="overflow-hidden rounded-full h-8 w-8">
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
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
