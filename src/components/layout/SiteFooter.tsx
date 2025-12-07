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
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
                <div className="flex-shrink-0">
                    <Link href="/">
                        <Image 
                            src="/logo.svg" 
                            alt="DigiCar Logo" 
                            width={120} 
                            height={40} 
                            draggable="false" 
                        />
                    </Link>
                </div>
                <div className="text-center md:text-right text-sm text-muted-foreground space-y-2 md:space-y-0">
                    <p>© {new Date().getFullYear()} Digicar. Todos los derechos reservados.</p>
                    <div className="flex justify-center md:justify-end gap-4">
                        <Link href="/legal/terminos-y-condiciones" className="hover:text-primary hover:underline">Términos y Condiciones</Link>
                        <Link href="/legal/politica-de-privacidad" className="hover:text-primary hover:underline">Política de Privacidad</Link>
                    </div>
                </div>
            </div>
            <div className="pt-4">
                <ThemeToggle />
            </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
