
'use client';
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Twitter } from "lucide-react";

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
      { href: "#", icon: Twitter, label: "Twitter/X" },
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
