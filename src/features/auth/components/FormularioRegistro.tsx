
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
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader, Home } from 'lucide-react';
import Link from 'next/link';
import PasswordStrength from './PasswordStrength';
import { Checkbox } from '@/components/ui/checkbox';
import { doc, setDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import Swal from 'sweetalert2';

const esquemaFormulario = z
  .object({
    name: z.string(),
    email: z.string().min(1, 'El correo electrónico es requerido.').email('Por favor, introduce un correo electrónico válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.')
        .refine(value => /[A-Z]/.test(value), { message: 'Debe contener al menos una letra mayúscula.' })
        .refine(value => /[a-z]/.test(value), { message: 'Debe contener al menos una letra minúscula.' })
        .refine(value => /[0-9]/.test(value), { message: 'Debe contener al menos un número.' })
        .refine(value => /[^a-zA-Z0-9]/.test(value), { message: 'Debe contener al menos un carácter especial.' }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones para continuar.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  }).superRefine((data, ctx) => {
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
});


type DatosFormulario = z.infer<typeof esquemaFormulario>;

export default function FormularioRegistro() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const adminUid = "oDqiYNo5iIWWWu8uJWOZMdheB8n2";


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
      
      const user = credencialUsuario.user;

      await updateProfile(user, {
        displayName: data.name,
      });

      await sendEmailVerification(user);

      // Create user profile document in Firestore
      const userDocRef = doc(firestore, 'usuarios', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: data.name,
        createdAt: serverTimestamp(),
      });
      
      // Increment user counter
      const contadorRef = doc(firestore, "contadores", "usuarios");
      await updateDoc(contadorRef, {
        total: increment(1),
      }).catch(async (error) => {
          // If the counter document doesn't exist, create it.
          if (error.code === 'not-found') {
             await setDoc(contadorRef, { total: 1 });
          } else {
            console.error("Error al incrementar el contador de usuarios:", error);
          }
      });

      await Swal.fire({
        title: '¡Revisa tu correo!',
        text: 'Hemos enviado un enlace de verificación a tu correo electrónico para completar el registro.',
        icon: 'success',
        confirmButtonColor: '#595c97',
      });
      
      if (user.uid === adminUid) {
        router.push('/admin');
      } else {
        router.push('/login');
      }

    } catch (error) {
      console.error(error);
      let description = (error as Error).message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
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
      Swal.fire({
        title: 'Error al crear la cuenta',
        text: description,
        icon: 'error',
        confirmButtonColor: '#595c97',
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
                    <Input {...field} />
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
                      <Link href="/legal/terminos-y-condiciones" className="text-primary hover:underline">
                        términos y condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link href="/legal/politica-de-privacidad" className="text-primary hover:underline">
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
