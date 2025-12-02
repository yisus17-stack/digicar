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
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const esquemaFormulario = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  logoUrl: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioMarca {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  marca: Marca | null;
  alGuardar: (data: Omit<Marca, 'id'>, nuevoArchivoLogo?: File) => void;
}

export default function FormularioMarca({ estaAbierto, alCambiarApertura, marca, alGuardar }: PropsFormularioMarca) {
  const [vistaPreviaLogo, setVistaPreviaLogo] = useState<string | null>(null);
  const [nuevoArchivoLogo, setNuevoArchivoLogo] = useState<File | undefined>(undefined);
  const refInputArchivo = useRef<HTMLInputElement>(null);

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
        setVistaPreviaLogo(marca.logoUrl || null);
      } else {
        form.reset({
          name: '',
          logoUrl: '',
        });
        setVistaPreviaLogo(null);
      }
      setNuevoArchivoLogo(undefined);
    }
  }, [marca, form, estaAbierto]);


  const alEnviar = (data: DatosFormulario) => {
    alGuardar(data, nuevoArchivoLogo);
    alCambiarApertura(false);
  };
  
  const manejarCambioArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNuevoArchivoLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVistaPreviaLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
             
            <FormItem>
                <FormLabel>Logo</FormLabel>
                <div className="flex items-center gap-4">
                    {vistaPreviaLogo ? (
                        <Image src={vistaPreviaLogo} alt="Vista previa del logo" width={64} height={64} className="rounded-md object-contain border p-1" />
                    ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                            <Upload className="h-8 w-8" />
                        </div>
                    )}
                    <Button type="button" variant="outline" onClick={() => refInputArchivo.current?.click()}>
                        Seleccionar Imagen
                    </Button>
                    <Input 
                        type="file" 
                        ref={refInputArchivo} 
                        className="hidden" 
                        onChange={manejarCambioArchivo}
                        accept="image/png, image/jpeg, image/webp, image/svg+xml"
                    />
                </div>
            </FormItem>

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
