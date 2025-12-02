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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const esquemaFormulario = z.object({
  brand: z.string().min(1, 'La marca es requerida.'),
  model: z.string().min(2, 'El modelo es requerido.'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  mileage: z.coerce.number().min(0),
  fuelType: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  transmission: z.string().min(1),
  engine: z.string().optional(),
  horsepower: z.coerce.number().min(0),
  features: z.string().optional(),
  type: z.enum(['Sedan', 'SUV', 'Sports', 'Truck', 'Hatchback']),
  engineCylinders: z.coerce.number().min(0),
  color: z.string().min(1),
  passengers: z.coerce.number().min(1),
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioAuto {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  auto: Car | null;
  alGuardar: (auto: Omit<Car, 'id'>, file?: File) => void;
  marcas: Marca[];
  colores: Color[];
  transmisiones: Transmision[];
}

export default function FormularioAuto({
  estaAbierto,
  alCambiarApertura,
  auto,
  alGuardar,
  marcas,
  colores,
  transmisiones,
}: PropsFormularioAuto) {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | undefined>();

  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      mileage: 0,
      fuelType: 'Gasoline',
      transmission: '',
      engine: '',
      horsepower: 0,
      features: '',
      type: 'Sedan',
      engineCylinders: 4,
      color: '',
      passengers: 5,
      imageUrl: '',
    },
  });

  useEffect(() => {
    if (estaAbierto) {
      if (auto) {
        form.reset({
          ...auto,
          features: auto.features.join(', '),
        });
        if (auto.imageUrl) {
            setPreview(auto.imageUrl);
        } else {
            setPreview(null);
        }
      } else {
        form.reset({
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          price: 0,
          mileage: 0,
          fuelType: 'Gasoline',
          transmission: '',
          engine: '',
          horsepower: 0,
          features: '',
          type: 'Sedan',
          engineCylinders: 4,
          color: '',
          passengers: 5,
          imageUrl: '',
        });
        setPreview(null);
      }
      setSelectedFile(undefined);
    }
  }, [auto, form, estaAbierto]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const alEnviar = (data: DatosFormulario) => {
    const datosAuto = {
      ...data,
      features: data.features ? data.features.split(',').map((f) => f.trim()) : [],
    };
    alGuardar(datosAuto, selectedFile);
    alCambiarApertura(false);
  };

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="specs">Especificaciones</TabsTrigger>
                <TabsTrigger value="media">Multimedia y Extras</TabsTrigger>
              </TabsList>
              <ScrollArea className="h-96 w-full p-1">
              <TabsContent value="general" className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="brand" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Marca</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger></FormControl>
                            <SelectContent>{marcas.map((brand) => (<SelectItem key={brand.id} value={brand.name}>{brand.name}</SelectItem>))}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="model" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="year" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Año</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="type" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Auto</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Sedan">Sedán</SelectItem>
                              <SelectItem value="SUV">SUV</SelectItem>
                              <SelectItem value="Sports">Deportivo</SelectItem>
                              <SelectItem value="Truck">Camioneta</SelectItem>
                              <SelectItem value="Hatchback">Hatchback</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="color" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona color" /></SelectTrigger></FormControl>
                            <SelectContent>{colores.map((color) => (<SelectItem key={color.id} value={color.name}>{color.name}</SelectItem>))}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}/>
                </div>
              </TabsContent>
              <TabsContent value="specs" className="p-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="mileage" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kilometraje/Autonomía</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="horsepower" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caballos de Fuerza</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="engine" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Motor</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="engineCylinders" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cilindros</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="transmission" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transmisión</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona transmisión" /></SelectTrigger></FormControl>
                            <SelectContent>{transmisiones.map((t) => (<SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>))}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="fuelType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Combustible</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="Gasoline">Gasolina</SelectItem>
                              <SelectItem value="Diesel">Diésel</SelectItem>
                              <SelectItem value="Electric">Eléctrico</SelectItem>
                              <SelectItem value="Hybrid">Híbrido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="passengers" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pasajeros</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                 </div>
              </TabsContent>
              <TabsContent value="media" className="p-4">
                <div className="space-y-4">
                    <FormField control={form.control} name="features" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Características (separadas por coma)</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormItem>
                        <FormLabel>Imagen del Auto</FormLabel>
                        <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    {preview && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Vista previa:</p>
                            <Image src={preview} alt="Vista previa del auto" width={200} height={150} className="rounded-md object-cover" />
                        </div>
                    )}
                </div>
              </TabsContent>
              </ScrollArea>
            </Tabs>
            
            <DialogFooter className="pt-4 mt-auto border-t">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
