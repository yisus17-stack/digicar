'use client';

import Link from 'next/link';
import {
  Search,
  User,
  X,
  Menu,
  Home,
  LayoutGrid,
  GitCompareArrows,
  Wand2,
  Landmark,
  ShieldCheck,
  LogIn,
  LogOut,
  UserPlus,
  MapPin,
  ShoppingCart,
  Wrench,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const SiteHeader = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const isAdmin = !!user;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cerrar la sesión. Inténtalo de nuevo.',
      });
    }
  };

  const mainNavLinks = [
    { href: '/catalog', label: 'VEHÍCULOS' },
    { href: '#', label: 'COMPRA' },
    { href: '#', label: 'MÚSCULO DIGICAR' },
    { href: '#', label: 'SERVICIOS' },
  ];

  const secondaryNavLinks = [
    { href: '#', label: 'CONCESIONARIO', icon: MapPin },
    { href: '#', label: 'TIENDA', icon: ShoppingCart },
    { href: '#', label: 'CONFIGURAR', icon: Wrench },
  ]

  const openSearch = () => setIsSearchVisible(true);
  const closeSearch = () => setIsSearchVisible(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchVisible) closeSearch();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);


  return (
    <>
      <header className="bg-black text-white sticky top-0 z-40 w-full border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo-red.svg"
              alt="DigiCar Logo"
              width={100}
              height={30}
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 text-sm font-bold tracking-wider uppercase">
            {mainNavLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
             <div className="hidden lg:flex items-center gap-4">
                {secondaryNavLinks.map(link => {
                    const Icon = link.icon;
                    return (
                        <Link href={link.href} key={link.label} className="flex items-center gap-2 text-sm font-bold uppercase hover:text-primary transition-colors">
                            <Icon className="h-4 w-4" />
                            <span>{link.label}</span>
                        </Link>
                    )
                })}
             </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-black border-white/20 text-white">
                {user ? (
                    <>
                        <DropdownMenuLabel>Hola, {user.displayName || user.email ||'Usuario'}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/20"/>
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <Link href="/profile">
                            <User className="mr-2 h-4 w-4" /> Mi Perfil
                          </Link>
                        </DropdownMenuItem>
                         {isAdmin && (
                            <>
                                <DropdownMenuSeparator className="bg-white/20"/>
                                <DropdownMenuLabel>Administración</DropdownMenuLabel>
                                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                                  <Link href="/admin/cars">
                                    <ShieldCheck className="mr-2 h-4 w-4" /> Administrar Autos
                                  </Link>
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator className="bg-white/20"/>
                        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer focus:bg-white/10 focus:text-white">
                            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/20"/>
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer">
                          <Link href="/register">
                            <UserPlus className="mr-2 h-4 w-4" /> Registrarse
                          </Link>
                        </DropdownMenuItem>
                    </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-white/10">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full bg-black text-white border-l-0">
                  <div className="p-4">
                    <SheetHeader className="pb-4 mb-4 border-b border-white/20">
                        <Link href="/" className="flex items-center">
                            <Image src="/logo-red.svg" alt="DigiCar Logo" width={120} height={40}/>
                        </Link>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-2 text-lg uppercase font-bold tracking-wider">
                      {[...mainNavLinks, ...secondaryNavLinks].map((link) => (
                        <Link key={link.href} href={link.href} className="flex items-center justify-between p-3 transition-colors hover:text-primary">
                          <span>{link.label}</span>
                          <ArrowRight className="h-5 w-5" />
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default SiteHeader;
