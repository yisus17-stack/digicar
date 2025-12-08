
'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";
import { useMounted } from "@/hooks/use-mounted";
import { Skeleton } from "../ui/skeleton";

const SiteFooterSkeleton = () => (
  <footer className="bg-background border-t">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Skeleton className="h-10 w-32" />
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex flex-col items-center md:items-end gap-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </div>
  </footer>
);


const SiteFooter = () => {
  const pathname = usePathname();
  const isMounted = useMounted();

  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  if (!isMounted) {
    return <SiteFooterSkeleton />;
  }
  
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-shrink-0">
            <Link href="/">
              <Image
                src="/digicar-logo.png"
                alt="DigiCar Logo"
                width={120}
                height={40}
                draggable="false"
                className="block dark:hidden high-contrast-hidden h-auto w-auto"
              />
              <Image
                src="/digicar-logo-blanco.png"
                alt="DigiCar Logo"
                width={120}
                height={40}
                draggable="false"
                className="hidden dark:block high-contrast-hidden h-auto w-auto"
              />
              <Image
                src="/digicar-logo-contraste.png"
                alt="DigiCar Logo de Alto Contraste"
                width={120}
                height={40}
                draggable="false"
                className="hidden high-contrast-block h-auto w-auto"
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
