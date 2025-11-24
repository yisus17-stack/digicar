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
import { TipoCombustible } from '@/lib/types';
import { useEffect } from 'react';

const esquemaFormulario = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioTipoCombustible {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  combustible: TipoCombustible | null;
  alGuardar: (fuel: Omit<TipoCombustible, 'id'>) => void;
}

export default function FormularioTipoCombustible({ estaAbierto, alCambiarApertura, combustible, alGuardar }: PropsFormularioTipoCombustible) {
  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      name: '',
    },
  });
  
  useEffect(() => {
    if (combustible) {
      form.reset(combustible);
    } else {
      form.reset({
        name: '',
      });
    }
  }, [combustible, form]);


  const alEnviar = (data: DatosFormulario) => {
    alGuardar(data);
    alCambiarApertura(false);
  };

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{combustible ? 'Editar Combustible' : 'Añadir Combustible'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre del Combustible</FormLabel>
                    <FormControl><Input placeholder="Ej: Gasolina" {...field} /></FormControl>
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
