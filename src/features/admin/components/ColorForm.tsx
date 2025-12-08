
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
import { Color } from '@/core/types';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const esquemaFormulario = z.object({
  nombre: z.string().min(2, 'El nombre es requerido.'),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioColor {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  color: Color | null;
  alGuardar: (color: Omit<Color, 'id'>) => Promise<boolean>;
  isSaving: boolean;
}

export default function FormularioColor({ estaAbierto, alCambiarApertura, color, alGuardar, isSaving }: PropsFormularioColor) {
  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      nombre: '',
    },
  });
  
  useEffect(() => {
    if (estaAbierto) {
      if (color) {
        form.reset(color);
      } else {
        form.reset({
          nombre: '',
        });
      }
    }
  }, [color, estaAbierto, form]);


  const alEnviar = async (data: DatosFormulario) => {
    const success = await alGuardar(data);
    if (!success) {
        Swal.fire({
            title: 'Color Duplicado',
            text: `El color "${data.nombre}" ya existe.`,
            icon: 'error',
            confirmButtonColor: '#595c97',
            target: document.querySelector('[role="dialog"]') || undefined,
        });
    }
  };

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{color ? 'Editar Color' : 'Añadir Color'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4 py-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre del Color</FormLabel>
                    <FormControl><Input placeholder="Ej: Rojo Pasión" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
            <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary" disabled={isSaving}>Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar Cambios
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
