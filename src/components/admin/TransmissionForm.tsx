'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Transmission } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
});

type FormData = z.infer<typeof formSchema>;

interface TransmissionFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transmission: Transmission | null;
  onSave: (transmission: Omit<Transmission, 'id'>) => void;
}

export default function TransmissionForm({ isOpen, onOpenChange, transmission, onSave }: TransmissionFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });
  
  useEffect(() => {
    if (transmission) {
      form.reset(transmission);
    } else {
      form.reset({
        name: '',
      });
    }
  }, [transmission, form]);


  const onSubmit = (data: FormData) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transmission ? 'Editar Transmisión' : 'Añadir Transmisión'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre de la Transmisión</FormLabel>
                    <FormControl><Input placeholder="Ej: Automática" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
