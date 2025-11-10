import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px-275px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
