import LoginForm from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
