import FormularioRegistro from '@/features/auth/components/FormularioRegistro';

export default function PaginaRegistro() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px-275px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <FormularioRegistro />
      </div>
    </div>
  );
}
