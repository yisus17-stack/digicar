
'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Twitter } from "lucide-react";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1-1.04-.85-1.68-2.03-1.68-3.34v6.22c0 .9-.06 1.79-.22 2.67-.36 2.03-1.55 3.59-3.23 4.52-1.61.88-3.44 1.14-5.22.84-1.79-.3-3.3-1.15-4.42-2.45-1.12-1.3-1.7-2.93-1.7-4.72 0-2.58 1.2-4.79 3.1-6.15 1.9-1.36 4.32-1.93 6.7-1.49v4.03c-1.1.23-2.15.7-3.04 1.35-.48.35-.91.77-1.26 1.24-.2.27-.37.58-.48.91-.12.33-.18.68-.18 1.03 0 1.13.51 2.11 1.32 2.73.81.62 1.83.94 2.94.88.55-.03 1.08-.16 1.58-.38.5-.22.95-.53 1.34-.9.39-.37.7-.82.92-1.32.22-.5.33-1.04.33-1.6v-6.7z" />
  </svg>
);


const SiteFooter = () => {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  const navLinks = [
      { href: "/catalogo", label: "Catálogo" },
      { href: "/comparacion", label: "Comparador" },
      { href: "/financiamiento", label: "Financiamiento" },
  ];
  
  const socialLinks = [
      { href: "#", icon: Facebook, label: "Facebook" },
      { href: "#", icon: Instagram, label: "Instagram" },
      { href: "#", icon: TikTokIcon, label: "TikTok" },
  ]

  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center text-center">
            {/* Logo */}
            <Link href="/" className="mb-6">
                <Image 
                    src="/logo.svg" 
                    alt="DigiCar Logo" 
                    width={180} 
                    height={60} 
                    draggable="false" 
                />
            </Link>

            {/* Main Links */}
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
                {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                        {link.label}
                    </Link>
                ))}
            </nav>
            
            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-8">
                {socialLinks.map((social) => (
                    <Link key={social.label} href={social.href} aria-label={social.label} className="text-muted-foreground hover:text-primary transition-colors">
                        <social.icon className="h-6 w-6" />
                    </Link>
                ))}
            </div>

            {/* Copyright & Legal */}
            <div className="text-sm text-muted-foreground space-y-2 md:space-y-0 md:flex md:items-center md:gap-4">
                <p>© {new Date().getFullYear()} Digicar. Todos los derechos reservados.</p>
                <div className="hidden md:block h-4 border-l"></div>
                <div className="flex justify-center gap-4">
                    <Link href="/legal/terminos-y-condiciones" className="hover:text-primary hover:underline">Términos y Condiciones</Link>
                    <Link href="/legal/politica-de-privacidad" className="hover:text-primary hover:underline">Política de Privacidad</Link>
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
