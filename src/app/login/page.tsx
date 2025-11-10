import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Iniciar Sesión</h1>
          <p className="mt-2 text-muted-foreground">
            Accede a tu cuenta para continuar.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
