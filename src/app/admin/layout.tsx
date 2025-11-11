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

// Context for Sidebar state
const SidebarContext = createContext<{
  isClosed: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
} | null>(null);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Main Sidebar Component
function AdminSidebar() {
  const { isClosed, toggleSidebar, isDarkMode, toggleDarkMode } = useSidebar();
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/cars', label: 'Autos', icon: Car },
    { href: '/admin/brands', label: 'Marcas', icon: Tag },
  ];

  return (
    <nav className={cn(
        "fixed top-0 left-0 h-full bg-[--sidebar-color] p-[10px_14px] transition-all duration-500 ease-in-out z-50",
        isClosed ? "w-[88px]" : "w-[250px]"
    )}>
      <header className="relative">
        <div className="flex items-center">
          <span className="image flex items-center justify-center min-w-[60px] rounded-md">
            <Car className="h-8 w-8 text-[--text-color]"/>
          </span>
          <div className={cn("flex flex-col text-[--text-color] transition-opacity duration-300", isClosed && "opacity-0")}>
            <span className="name text-lg font-semibold mt-0.5">DigiCar</span>
            <span className="profession text-base -mt-0.5 block">Admin Panel</span>
          </div>
        </div>
        <i
          className={cn(
            'absolute top-1/2 -right-6 transform -translate-y-1/2 h-6 w-6 bg-[--primary-color] text-[--sidebar-color] rounded-full flex items-center justify-center text-2xl cursor-pointer transition-transform duration-500',
            !isClosed && 'rotate-180'
          )}
          onClick={toggleSidebar}
        >
          <ChevronRight className="h-4 w-4" />
        </i>
      </header>

      <div className="h-[calc(100%-55px)] flex flex-col justify-between overflow-y-auto no-scrollbar mt-10">
        <div className="menu">
          <li className="search-box h-[50px] list-none flex items-center mt-2.5 rounded-md bg-[--primary-color-light] cursor-pointer transition-all duration-500">
            <Search className="icon min-w-[60px] h-full flex items-center justify-center text-xl text-[--text-color] transition-all duration-300" />
            <input type="text" placeholder="Buscar..." className={cn("h-full w-full outline-none border-none bg-[--primary-color-light] text-[--text-color] rounded-md text-base font-medium transition-all duration-500", isClosed && "opacity-0 w-0")} />
          </li>

          <ul className="menu-links mt-2.5 p-0">
            {navItems.map((item) => (
              <li key={item.href} className="nav-link h-[50px] list-none flex items-center mt-2.5">
                <Link href={item.href} className={cn(
                  "h-full w-full flex items-center rounded-md text-decoration-none transition-all duration-300",
                  pathname === item.href ? "bg-[--primary-color] text-[--sidebar-color]" : "text-[--text-color] hover:bg-[--primary-color]"
                )}>
                  <item.icon className={cn("icon min-w-[60px] h-full flex items-center justify-center text-xl transition-all duration-300", pathname === item.href ? "text-[--sidebar-color]" : "hover:text-[--sidebar-color]")}/>
                  <span className={cn("text text-base font-medium whitespace-nowrap transition-opacity duration-300", isClosed && "opacity-0", pathname === item.href ? "text-[--sidebar-color]" : "hover:text-[--sidebar-color]")}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bottom-content">
           <li className="h-[50px] list-none flex items-center mt-2.5">
                <Link href="/" className="h-full w-full flex items-center rounded-md text-decoration-none transition-all duration-300 text-[--text-color] hover:bg-[--primary-color]">
                    <Home className="icon min-w-[60px] h-full flex items-center justify-center text-xl transition-all duration-300 hover:text-[--sidebar-color]" />
                    <span className={cn("text text-base font-medium whitespace-nowrap transition-opacity duration-300", isClosed && "opacity-0", "hover:text-[--sidebar-color]")}>
                        Ir al Inicio
                    </span>
                </Link>
            </li>
        </div>
      </div>
       <style jsx global>{`
        body.dark {
          --body-color: #18191a;
          --sidebar-color: #242526;
          --primary-color: #3a3b3c;
          --primary-color-light: #3a3b3c;
          --toggle-color: #fff;
          --text-color: #ccc;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .nav-link a:hover .icon,
        .nav-link a:hover .text {
            color: var(--sidebar-color);
        }
        body.dark .nav-link a:hover .icon,
        body.dark .nav-link a:hover .text {
            color: var(--text-color);
        }
       `}</style>
    </nav>
  );
}

// Sidebar Provider
const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isClosed, setIsClosed] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const body = document.querySelector('body');
    if (body) {
        if (isDarkMode) {
            body.classList.add('dark');
        } else {
            body.classList.remove('dark');
        }
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsClosed(!isClosed);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <SidebarContext.Provider value={{ isClosed, toggleSidebar, isDarkMode, toggleDarkMode }}>
      {children}
    </SidebarContext.Provider>
  );
};


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


  if (userLoading || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-[--body-color]">
            <p className="text-[--text-color]">Cargando...</p>
        </div>
    );
  }
  
  return (
    <SidebarProvider>
        <div className='bg-[--body-color]'>
            <AdminSidebar />
            <section className={cn("relative h-screen bg-[--body-color] transition-all duration-500 ease-in-out", "left-[250px] w-[calc(100%-250px)]", {"!left-[88px] !w-[calc(100%-88px)]": useContext(SidebarContext)?.isClosed})}>
                <div className="p-6 text-[--text-color]">
                    {children}
                </div>
            </section>
        </div>
    </SidebarProvider>
  );
}
