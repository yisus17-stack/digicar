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
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  interestedCar: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface LeadCaptureFormProps {
  interestedCar?: string;
}

export default function LeadCaptureForm({ interestedCar = '' }: LeadCaptureFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      interestedCar: interestedCar,
    },
  });

  useEffect(() => {
    form.setValue('interestedCar', interestedCar);
  }, [interestedCar, form]);

  const onSubmit = (data: FormData) => {
    console.log('Cliente potencial capturado:', data);
    toast({
      title: '¡Consulta Enviada!',
      description: "Gracias por tu interés. Nos pondremos en contacto en breve.",
    });
    form.reset({ name: '', email: '', interestedCar: interestedCar });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Juan Pérez" {...field} />
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
                  <Input placeholder="juan.perez@ejemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="interestedCar"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormLabel>Auto de Interés</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <Button type="submit" className="w-full">Enviar Consulta</Button>
      </form>
    </Form>
  );
}
