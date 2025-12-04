
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
import { useAuth, useUser } from '@/firebase';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { Loader } from 'lucide-react';
import PasswordStrength from './PasswordStrength';

const esquemaFormulario = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida.'),
    newPassword: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    // Validación de la nueva contraseña
    if (data.newPassword.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La nueva contraseña es requerida.',
        path: ['newPassword'],
      });
    } else {
      if (data.newPassword.length < 8) ctx.addIssue({ code: 'custom', message: 'La contraseña debe tener al menos 8 caracteres.', path: ['newPassword'] });
      if (!/[A-Z]/.test(data.newPassword)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos una letra mayúscula.', path: ['newPassword'] });
      if (!/[a-z]/.test(data.newPassword)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos una letra minúscula.', path: ['newPassword'] });
      if (!/[0-9]/.test(data.newPassword)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos un número.', path: ['newPassword'] });
      if (!/[^a-zA-Z0-9]/.test(data.newPassword)) ctx.addIssue({ code: 'custom', message: 'Debe contener al menos un carácter especial.', path: ['newPassword'] });
    }

    // Validación de confirmación de contraseña
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden.',
        path: ['confirmPassword'],
      });
    }

    if(data.currentPassword === data.newPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'La nueva contraseña no puede ser igual a la actual.',
            path: ['newPassword'],
        });
    }
  });

type DatosFormulario = z.infer<typeof esquemaFormulario>;

export default function ChangePasswordForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user } = useUser();
  const [cargando, setCargando] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    mode: 'onTouched',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const alEnviar = async (data: DatosFormulario) => {
    setCargando(true);

    if (!user || !user.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se ha podido identificar al usuario.',
      });
      setCargando(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);

      toast({
        title: '¡Contraseña Actualizada!',
        description: 'Tu contraseña ha sido cambiada exitosamente.',
      });
      form.reset();
      setPasswordValue('');
    } catch (error) {
      console.error(error);
      let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/wrong-password':
          case 'auth/invalid-credential':
            description = 'La contraseña actual es incorrecta.';
            break;
          case 'auth/weak-password':
            description = 'La nueva contraseña es demasiado débil.';
            break;
          case 'auth/too-many-requests':
            description = 'Has intentado reautenticarte demasiadas veces. Inténtalo más tarde.';
            break;
        }
      }
      toast({
        variant: 'destructive',
        title: 'Error al cambiar la contraseña',
        description,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña Actual</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva Contraseña</FormLabel>
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
              <FormLabel>Confirmar Nueva Contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={cargando}>
          {cargando && <Loader className="mr-2 h-4 w-4 animate-spin" />}
          Cambiar Contraseña
        </Button>
      </form>
    </Form>
  );
}
