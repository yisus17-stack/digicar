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
import { useEffect, useState } from 'react';
import Image from 'next/image';

const esquemaFormulario = z.object({
  nombre: z.string().min(2, 'El nombre es requerido.'),
  logoUrl: z.string().optional(),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioMarca {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  marca: Marca | null;
  alGuardar: (data: Omit<Marca, 'id'>, file?: File) => void;
}

export default function FormularioMarca({ estaAbierto, alCambiarApertura, marca, alGuardar }: PropsFormularioMarca) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  
  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      nombre: '',
      logoUrl: '',
    },
  });
  
  useEffect(() => {
    if (estaAbierto) {
      if (marca) {
        form.reset({
            nombre: marca.nombre || '',
            logoUrl: marca.logoUrl || '',
        });
        setPreview(marca.logoUrl || null);
      } else {
        form.reset({
          nombre: '',
          logoUrl: '',
        });
        setPreview(null);
      }
      setSelectedFile(undefined);
    }
  }, [marca, estaAbierto, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        form.setValue('logoUrl', result, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const alEnviar = (data: DatosFormulario) => {
    const finalData = { ...data, logoUrl: preview || data.logoUrl || '' };
    alGuardar(finalData, selectedFile);
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
            <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre de la Marca</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             
            <FormItem>
              <FormLabel>Subir logo</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleFileChange} />
              </FormControl>
              <FormMessage />
            </FormItem>

            {preview && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <Image src={preview} alt="Vista previa del logo" width={100} height={100} className="rounded-md object-contain border" />
              </div>
            )}
            
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem className='hidden'>
                    <FormLabel>URL del logo</FormLabel>
                    <FormControl><Input {...field} readOnly/></FormControl>
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
