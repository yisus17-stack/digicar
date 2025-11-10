import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col items-start justify-center p-12 lg:p-24 bg-blue-900 text-white relative auth-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 opacity-75"></div>
        <div className="relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Crea tu Futuro
          </h1>
          <p className="text-lg lg:text-xl text-blue-200">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold underline hover:text-white">
              Inicia sesión.
            </Link>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 lg:p-12 bg-card text-card-foreground">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}