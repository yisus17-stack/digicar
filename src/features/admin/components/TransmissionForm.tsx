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
import { Transmision } from '@/core/types';
import { useEffect } from 'react';

const esquemaFormulario = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioTransmision {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  transmision: Transmision | null;
  alGuardar: (transmission: Omit<Transmision, 'id'>) => void;
}

export default function FormularioTransmision({ estaAbierto, alCambiarApertura, transmision, alGuardar }: PropsFormularioTransmision) {
  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      name: '',
    },
  });
  
  useEffect(() => {
    if (transmision) {
      form.reset(transmision);
    } else {
      form.reset({
        name: '',
      });
    }
  }, [transmision, estaAbierto]);


  const alEnviar = (data: DatosFormulario) => {
    alGuardar(data);
    alCambiarApertura(false);
  };

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transmision ? 'Editar Transmisión' : 'Añadir Transmisión'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4 py-4">
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
