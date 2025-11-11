import Link from "next/link";
import Image from "next/image";

const SiteFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Image src="/logo.png" alt="DigiCar Logo" width={150} height={50} />
            </div>
            <p>Av. Principal No. 173</p>
            <p>Colonia Centro</p>
            <p>Maravatío, Michoacán</p>
            <p>contacto@digicar.com.mx</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link href="/catalog" className="hover:underline">Catálogo</Link></li>
              <li><Link href="/simulator" className="hover:underline">Simulador</Link></li>
              <li><Link href="/compare" className="hover:underline">Comparador</Link></li>
              <li><Link href="/financing" className="hover:underline">Financiamiento</Link></li>
              <li><Link href="#" className="hover:underline">Chat</Link></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4">Redes sociales</h3>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link href="#" aria-label="Facebook" className="group">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-foreground">
                      <div className="h-6 w-6 bg-primary-foreground transition-colors duration-300 group-hover:bg-primary mask-facebook"></div>
                  </div>
              </Link>
              <Link href="#" aria-label="Instagram" className="group">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-foreground">
                      <div className="h-6 w-6 bg-primary-foreground transition-colors duration-300 group-hover:bg-primary mask-instagram"></div>
                  </div>
              </Link>
              <Link href="#" aria-label="Twitter" className="group">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-primary-foreground">
                      <div className="h-6 w-6 bg-primary-foreground transition-colors duration-300 group-hover:bg-primary mask-x"></div>
                  </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center text-center">
            <p className="mb-4 md:mb-0">© {new Date().getFullYear()} Digicar. Todos los derechos reservados.</p>
            <div className="flex justify-center text-xs gap-2">
                <Link href="#" className="hover:underline">Términos y Condiciones</Link>
                <span>|</span>
                <Link href="#" className="hover:underline">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
