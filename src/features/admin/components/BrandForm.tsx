
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
import { X, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Swal from 'sweetalert2';

const esquemaFormulario = z.object({
  nombre: z.string().min(2, 'El nombre es requerido.'),
  logoUrl: z.string().optional(),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioMarca {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  marca: Marca | null;
  alGuardar: (data: Omit<Marca, 'id'>, file: File | undefined) => Promise<boolean>;
  isSaving: boolean;
}

export default function FormularioMarca({ estaAbierto, alCambiarApertura, marca, alGuardar, isSaving }: PropsFormularioMarca) {
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

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(undefined);
    form.setValue('logoUrl', '', { shouldValidate: true });
  };

  const alEnviar = async (data: DatosFormulario, event: React.FormEvent<HTMLFormElement>) => {
    const finalData = { ...data, logoUrl: preview || data.logoUrl || '' };
    const success = await alGuardar(finalData, selectedFile);
    if (!success) {
        Swal.fire({
            title: 'Marca Duplicada',
            text: `La marca "${data.nombre}" ya existe.`,
            icon: 'error',
            confirmButtonColor: '#595c97',
            target: event.currentTarget.closest('[role="dialog"]') || undefined,
        });
    }
  };
  
  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{marca ? 'Editar Marca' : 'Añadir Marca'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(data => alEnviar(data, e))(); }} className="space-y-4 py-4">
            <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                    <FormLabel>Nombre de la Marca</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
             
            <FormItem>
              <FormLabel>Subir logo</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <label htmlFor="file-upload-brand" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                    Elegir archivo
                    <Input id="file-upload-brand" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </FormControl>

                {preview ? (
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden border">
                    <img src={preview} alt="Vista previa" className="object-contain w-full h-full" draggable="false" />
                  </div>
                ) : (
                  <div className="w-24 h-16 flex items-center justify-center bg-muted rounded-lg text-xs text-muted-foreground">
                    Sin logo
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
            
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem className='hidden'>
                    <FormLabel>URL del logo</FormLabel>
                    <FormControl><Input {...field} readOnly/></FormControl>
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
