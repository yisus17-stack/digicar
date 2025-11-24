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
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido.'),
  logoUrl: z.string().url('Debe ser una URL válida.').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface BrandFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  brand: Brand | null;
  onSave: (data: Omit<Brand, 'id'>, newLogoFile?: File) => void;
}

export default function BrandForm({ isOpen, onOpenChange, brand, onSave }: BrandFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [newLogoFile, setNewLogoFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logoUrl: '',
    },
  });
  
  useEffect(() => {
    if (isOpen) {
      if (brand) {
        form.reset(brand);
        setLogoPreview(brand.logoUrl || null);
      } else {
        form.reset({
          name: '',
          logoUrl: '',
        });
        setLogoPreview(null);
      }
      setNewLogoFile(undefined);
    }
  }, [brand, form, isOpen]);


  const onSubmit = (data: FormData) => {
    onSave(data, newLogoFile);
    onOpenChange(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
             
            <FormItem>
                <FormLabel>Logo</FormLabel>
                <div className="flex items-center gap-4">
                    {logoPreview ? (
                        <Image src={logoPreview} alt="Vista previa del logo" width={64} height={64} className="rounded-md object-contain border p-1" />
                    ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
                            <Upload className="h-8 w-8" />
                        </div>
                    )}
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Seleccionar Imagen
                    </Button>
                    <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
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
