
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
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import PasswordStrength from './PasswordStrength';
import { Checkbox } from '@/components/ui/checkbox';

const esquemaFormulario = z
  .object({
    name: z.string(),
    email: z.string(),
    password: z.string(),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones para continuar.',
    }),
  })
  .superRefine((data, ctx) => {
    // Validación del nombre
    if (data.name.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El nombre es requerido.',
        path: ['name'],
      });
    } else {
      const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]+$/;
      if (!nameRegex.test(data.name)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El nombre solo puede contener letras y espacios.',
          path: ['name'],
        });
      } else {
        const words = data.name.trim().split(/\s+/);
        if (words.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Por favor, introduce tu nombre y al menos un apellido.',
            path: ['name'],
          });
        } else {
          for (const word of words) {
            if (word.length < 3) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Cada nombre y apellido debe tener al menos 3 caracteres.',
                path: ['name'],
              });
              break; 
            }
          }
        }
      }
    }


    // Validación del email
    if (data.email.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El correo electrónico es requerido.',
        path: ['email'],
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(data.email) || !z.string().email().safeParse(data.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Por favor, introduce un correo electrónico válido.',
          path: ['email'],
        });
      }
    }
    
    // Validación de la contraseña
    if (data.password.length === 0) {
         ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La contraseña es requerida.',
            path: ['password'],
        });
    } else {
        if (data.password.length < 8) ctx.addIssue({ code: 'custom', message: 'La contraseña debe tener al menos 8 caracteres.', path: ['password'] });
        if (!/[A-Z]/.test(data.password)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos una letra mayúscula.', path: ['password'] });
        if (!/[a-z]/.test(data.password)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos una letra minúscula.', path: ['password'] });
        if (!/[0-9]/.test(data.password)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos un número.', path: ['password'] });
        if (!/[^a-zA-Z0-9]/.test(data.password)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos un carácter especial.', path: ['password'] });
    }

    // Validación de confirmación de contraseña
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden.',
        path: ['confirmPassword'],
      });
    }
  });

type DatosFormulario = z.infer<typeof esquemaFormulario>;

export default function FormularioRegistro() {
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');


  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const alEnviar = async (data: DatosFormulario) => {
    setCargando(true);
    try {
      const credencialUsuario = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(credencialUsuario.user, {
        displayName: data.name,
      });

      toast({
        title: '¡Cuenta Creada!',
        description: 'Tu cuenta ha sido creada exitosamente.',
      });
      router.push('/');
    } catch (error) {
      console.error(error);
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            description = 'Este correo electrónico ya está registrado.';
            break;
          case 'auth/invalid-email':
            description = 'El formato del correo electrónico no es válido.';
            break;
          case 'auth/weak-password':
            description = 'La contraseña es demasiado débil.';
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Error al crear la cuenta',
        description,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Crear una Cuenta</CardTitle>
        <CardDescription>
          Rellena el formulario para empezar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} onChange={e => {
                        const sanitized = e.target.value.replace(/[^a-zA-Z\u00C0-\u017F ]/g, '');
                        field.onChange(sanitized);
                    }}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setPasswordValue(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {passwordValue && <PasswordStrength password={passwordValue} />}

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mr-3"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Acepto los{' '}
                      <Link href="/legal/terminos-y-condiciones" className="underline text-blue-600 hover:text-blue-800">
                        términos y condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="/legal/politica-de-privacidad" className="underline text-blue-600 hover:text-blue-800">
                        política de privacidad
                      </Link>
                      .
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cuenta
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter className="flex justify-center text-sm">
        <span className="text-muted-foreground">¿Ya tienes una cuenta?</span>
        <Button variant="link" asChild className="p-1">
          <Link href="/login">Inicia Sesión</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
