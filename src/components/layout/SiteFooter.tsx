import Link from "next/link";
import Image from "next/image";

const SiteFooter = () => {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Image src="/logo-white.png" alt="DigiCar Logo" width={150} height={50} />
            </div>
            <p className="text-accent-foreground/80">Av. Principal No. 173</p>
            <p className="text-accent-foreground/80">Colonia Centro</p>
            <p className="text-accent-foreground/80">Maravatío, Michoacán</p>
            <p className="text-accent-foreground/80">contacto@digicar.com.mx</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link href="/catalog" className="text-accent-foreground/80 hover:text-accent-foreground hover:underline">Catálogo</Link></li>
              <li><Link href="/simulator" className="text-accent-foreground/80 hover:text-accent-foreground hover:underline">Simulador</Link></li>
              <li><Link href="/compare" className="text-accent-foreground/80 hover:text-accent-foreground hover:underline">Comparador</Link></li>
              <li><Link href="/financing" className="text-accent-foreground/80 hover:text-accent-foreground hover:underline">Financiamiento</Link></li>
              <li><Link href="#" className="text-accent-foreground/80 hover:text-accent-foreground hover:underline">Chat</Link></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-bold text-lg mb-4">Redes sociales</h3>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link href="#" aria-label="Facebook" className="group">
                  <div className="w-10 h-10 rounded-full border-2 border-accent-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-accent-foreground">
                      <div className="h-6 w-6 bg-accent-foreground transition-colors duration-300 group-hover:bg-accent mask-facebook"></div>
                  </div>
              </Link>
              <Link href="#" aria-label="Instagram" className="group">
                  <div className="w-10 h-10 rounded-full border-2 border-accent-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-accent-foreground">
                      <div className="h-6 w-6 bg-accent-foreground transition-colors duration-300 group-hover:bg-accent mask-instagram"></div>
                  </div>
              </Link>
              <Link href="#" aria-label="Twitter" className="group">
                  <div className="w-10 h-10 rounded-full border-2 border-accent-foreground flex items-center justify-center transition-colors duration-300 group-hover:bg-accent-foreground">
                      <div className="h-6 w-6 bg-accent-foreground transition-colors duration-300 group-hover:bg-accent mask-x"></div>
                  </div>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-accent-foreground/20 mt-8 pt-6 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center text-center">
            <p className="mb-4 md:mb-0 text-accent-foreground/80">© {new Date().getFullYear()} Digicar. Todos los derechos reservados.</p>
            <div className="flex justify-center text-xs gap-2 text-accent-foreground/80">
                <Link href="#" className="hover:text-accent-foreground hover:underline">Términos y Condiciones</Link>
                <span>|</span>
                <Link href="#" className="hover:text-accent-foreground hover:underline">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
