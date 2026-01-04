
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import Swal from 'sweetalert2';

const formSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.').min(1, 'El correo electrónico es requerido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});


type FormData = z.infer<typeof formSchema>;

export default function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const adminUid = "oDqiYNo5iIWWWu8uJWOZMdheB8n2";

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handlePasswordReset = async () => {
    const { value: email } = await Swal.fire({
      title: 'Recuperar Contraseña',
      input: 'email',
      inputLabel: 'Introduce tu correo electrónico',
      inputPlaceholder: 'tu@email.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar enlace',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#595c97',
    });

    if (email) {
      setIsLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        Swal.fire({
          title: '¡Enlace Enviado!',
          text: 'Hemos enviado un enlace para restablecer tu contraseña a tu correo electrónico.',
          icon: 'success',
          confirmButtonColor: '#595c97',
        });
      } catch (error: any) {
        let description = 'Ocurrió un error al enviar el correo.';
        if (error.code === 'auth/user-not-found') {
          description = 'No se encontró ninguna cuenta con ese correo electrónico.';
        }
        Swal.fire({
          title: 'Error',
          text: description,
          icon: 'error',
          confirmButtonColor: '#595c97',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      if (user.emailVerified || user.uid === adminUid) {
        await Swal.fire({
          title: '¡Bienvenido de vuelta!',
          text: 'Has iniciado sesión correctamente.',
          icon: 'success',
          confirmButtonColor: '#595c97',
        });
        
        if (user.uid === adminUid) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        await auth.signOut();
        await Swal.fire({
          title: 'Verifica tu Correo',
          text: 'Tu cuenta no ha sido verificada. Por favor, revisa tu correo electrónico y sigue el enlace de verificación.',
          icon: 'warning',
          confirmButtonColor: '#595c97',
        });
      }

    } catch (error: any) {
        const code =
          error?.code ||
          error?.message ||
          error?.error ||
          "unknown";

        let description = "Ocurrió un error. Inténtalo nuevamente.";

        if (code.includes("auth/user-not-found") || code.includes("wrong-password") || code.includes("invalid-credential")) {
          description = "Correo o contraseña incorrectos.";
        } else if (code.includes("invalid-email")) {
          description = "El correo no tiene un formato válido.";
        } else if (code.includes("auth/too-many-requests")) {
          description = "Demasiados intentos fallidos. Intenta más tarde.";
        }

        Swal.fire({
          title: "Error al iniciar sesión",
          text: description,
          icon: "error",
          confirmButtonColor: "#595c97",
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Iniciar Sesión</CardTitle>
        <CardDescription>Accede a tu cuenta para continuar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Contraseña</FormLabel>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={handlePasswordReset}
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground">¿No tienes una cuenta?</span>
        <Button variant="link" asChild className="p-1">
          <Link href="/register">Regístrate</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
