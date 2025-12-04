import FormularioRegistro from '@/features/auth/components/FormularioRegistro';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function PaginaRegistro() {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-8 px-4">
      <div className="absolute top-8 left-8">
        <Button variant="outline" asChild>
            <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Ir a Inicio
            </Link>
        </Button>
      </div>
      <div className="w-full max-w-sm">
        <FormularioRegistro />
      </div>
    </div>
  );
}
