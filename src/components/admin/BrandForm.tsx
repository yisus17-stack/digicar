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
import { Brand } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  logoUrl: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface BrandFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSave: (brand: Omit<Brand, 'id'>) => void;
}

export default function BrandForm({ isOpen, onOpenChange, brand, onSave }: BrandFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
    },
  });
  
  useEffect(() => {
    if (brand) {
      form.reset(brand);
    } else {
      form.reset({
        name: '',
        logoUrl: '',
      });
    }
  }, [brand, form]);


  const onSubmit = (data: FormData) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{brand ? 'Editar Marca' : 'Añadir Marca'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre de la Marca</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel>URL del Logo (Opcional)</FormLabel>
                    <FormControl><Input placeholder="https://ejemplo.com/logo.png" {...field} /></FormControl>
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
