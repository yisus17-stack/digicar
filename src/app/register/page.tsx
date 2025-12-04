import FormularioRegistro from '@/features/auth/components/FormularioRegistro';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function PaginaRegistro() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
         <div className="flex justify-start">
            <Button variant="outline" asChild>
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Ir a Inicio
                </Link>
            </Button>
        </div>
        <FormularioRegistro />
      </div>
    </div>
  );
}
