'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";

const SiteFooter = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="DigiCar Logo"
                width={120}
                height={40}
                draggable="false"
                className="dark:hidden"
              />
              <Image
                src="/logo-white.png"
                alt="DigiCar Logo"
                width={120}
                height={40}
                draggable="false"
                className="hidden dark:block"
              />
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted-foreground">
            <div className="text-center md:text-right">
              <p>© {new Date().getFullYear()} Digicar. Todos los derechos reservados.</p>
              <div className="flex justify-center md:justify-end gap-4 mt-1">
                <Link href="/legal/terminos-y-condiciones" className="hover:text-primary hover:underline">Términos y Condiciones</Link>
                <Link href="/legal/politica-de-privacidad" className="hover:text-primary hover:underline">Política de Privacidad</Link>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
