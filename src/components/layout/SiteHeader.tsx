import Link from 'next/link';
import { Car } from 'lucide-react';

const SiteHeader = () => {
  return (
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-16 items-center space-x-4 px-4 sm:justify-between sm:space-x-0">
        <Link href="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg font-headline">DigiCar</span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors hover:text-primary"
          >
            Catálogo
          </Link>
          <Link
            href="/compare"
            className="transition-colors hover:text-primary"
          >
            Comparar
          </Link>
          <Link
            href="/simulator"
            className="transition-colors hover:text-primary"
          >
            Simulador
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
