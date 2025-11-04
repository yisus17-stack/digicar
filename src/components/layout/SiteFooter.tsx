import Link from "next/link";
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Image from "next/image";

const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <Image src="/logo-light.svg" alt="DigiCar Logo" width={150} height={50} />
            </div>
            <p>Av. Principal No. 173</p>
            <p>Colonia Centro</p>
            <p>Maravatío, Michoacán</p>
            <p>contacto@digicar.com.mx</p>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:underline">Catálogo</Link></li>
              <li><Link href="/simulator" className="hover:underline">Simulador</Link></li>
              <li><Link href="/compare" className="hover:underline">Comparador</Link></li>
              <li><Link href="#" className="hover:underline">Chat</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-4">Redes sociales</h3>
            <div className="flex gap-4">
              <Link href="#" aria-label="Facebook">
                <Facebook className="h-6 w-6 border rounded-full p-1" />
              </Link>
              <Link href="#" aria-label="Instagram">
                <Instagram className="h-6 w-6 border rounded-full p-1" />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter className="h-6 w-6 border rounded-full p-1" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-sm flex flex-col md:flex-row justify-between items-center">
            <p>© {new Date().getFullYear()} Digicar. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <Link href="#" className="hover:underline">Términos y Condiciones</Link>
                <span>|</span>
                <Link href="#" className="hover:underline">Política de Privacidad</Link>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
