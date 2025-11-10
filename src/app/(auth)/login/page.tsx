import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col items-start justify-center p-12 lg:p-24 bg-blue-900 text-white relative auth-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 opacity-75"></div>
        <div className="relative z-10">
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Sueña en Grande
          </h1>
          <p className="text-lg lg:text-xl text-blue-200">
            Si no eres parte de nuestra comunidad,{' '}
            <Link href="/register" className="font-semibold underline hover:text-white">
              regrístrate aquí.
            </Link>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-8 lg:p-12 bg-card text-card-foreground">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}