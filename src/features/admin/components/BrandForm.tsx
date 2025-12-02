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
import { Marca } from '@/core/types';
import { useEffect } from 'react';

const esquemaFormulario = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  logoUrl: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioMarca {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  marca: Marca | null;
  alGuardar: (data: Omit<Marca, 'id'>) => void;
}

export default function FormularioMarca({ estaAbierto, alCambiarApertura, marca, alGuardar }: PropsFormularioMarca) {
  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      name: '',
      logoUrl: '',
    },
  });
  
  useEffect(() => {
    if (estaAbierto) {
      if (marca) {
        form.reset(marca);
      } else {
        form.reset({
          name: '',
          logoUrl: '',
        });
      }
    }
  }, [marca, form, estaAbierto]);


  const alEnviar = (data: DatosFormulario) => {
    alGuardar(data);
    alCambiarApertura(false);
  };
  
  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{marca ? 'Editar Marca' : 'Añadir Marca'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre de la Marca</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem>
                    <FormLabel>URL del Logo</FormLabel>
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
