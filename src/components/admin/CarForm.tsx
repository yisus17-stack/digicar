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
import type { Car, Brand, Color, Transmission } from '@/lib/types';
import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import Image from 'next/image';

const formSchema = z.object({
  brand: z.string().min(1, 'La marca es requerida.'),
  model: z.string().min(2, 'El modelo es requerido.'),
  year: z.coerce.number().min(1900, 'Año inválido.').max(new Date().getFullYear() + 1, 'Año inválido.'),
  price: z.coerce.number().min(0, 'El precio debe ser positivo.'),
  mileage: z.coerce.number().min(0, 'El kilometraje debe ser positivo.'),
  fuelType: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  transmission: z.string().min(1, 'La transmisión es requerida.'),
  engine: z.string().optional(),
  horsepower: z.coerce.number().min(0, 'Los caballos de fuerza deben ser positivos.'),
  features: z.string().optional(),
  type: z.enum(['Sedan', 'SUV', 'Sports', 'Truck', 'Hatchback']),
  engineCylinders: z.coerce.number().min(0),
  color: z.string().min(1, 'El color es requerido.'),
  passengers: z.coerce.number().min(1),
  imageUrl: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface CarFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  car: Car | null;
  onSave: (car: Omit<Car, 'id'>, newImageFile?: File) => void;
  brands: Brand[];
  colors: Color[];
  transmissions: Transmission[];
}

export default function CarForm({ isOpen, onOpenChange, car, onSave, brands, colors, transmissions }: CarFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
    if (isOpen) {
        if (car) {
          form.reset({
            ...car,
            features: car.features.join(', '),
          });
          setImagePreview(car.imageUrl || null);
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
          setImagePreview(null);
        }
        setNewImageFile(undefined);
    }
  }, [car, form, isOpen]);


  const onSubmit = (data: FormData) => {
    const carData = {
        ...data,
        features: data.features ? data.features.split(',').map(f => f.trim()) : [],
    };
    // @ts-ignore
    onSave(carData, newImageFile);
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{car ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Marca</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una marca" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.name}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem><FormLabel>Año</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="mileage" render={({ field }) => (
                    <FormItem><FormLabel>Kilometraje/Autonomía</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="horsepower" render={({ field }) => (
                    <FormItem><FormLabel>Caballos de Fuerza</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="engineCylinders" render={({ field }) => (
                    <FormItem><FormLabel>Cilindros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="passengers" render={({ field }) => (
                    <FormItem><FormLabel>Pasajeros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Color</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un color" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {colors.map((color) => (
                                        <SelectItem key={color.id} value={color.name}>
                                            {color.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="engine" render={({ field }) => (
                    <FormItem><FormLabel>Motor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem><FormLabel>Tipo</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Sedan">Sedán</SelectItem><SelectItem value="SUV">SUV</SelectItem><SelectItem value="Sports">Deportivo</SelectItem><SelectItem value="Truck">Camioneta</SelectItem><SelectItem value="Hatchback">Hatchback</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="fuelType" render={({ field }) => (
                    <FormItem><FormLabel>Combustible</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="Gasoline">Gasolina</SelectItem><SelectItem value="Diesel">Diésel</SelectItem><SelectItem value="Electric">Eléctrico</SelectItem><SelectItem value="Hybrid">Híbrido</SelectItem></SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Transmisión</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una transmisión" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {transmissions.map((transmission) => (
                                        <SelectItem key={transmission.id} value={transmission.name}>
                                            {transmission.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField control={form.control} name="features" render={({ field }) => (
                <FormItem><FormLabel>Características (separadas por coma)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormItem>
                <FormLabel>Imagen del Auto</FormLabel>
                <div className="flex items-center gap-4">
                    {imagePreview ? (
                        <Image src={imagePreview} alt="Vista previa del auto" width={128} height={96} className="rounded-md object-cover border p-1" />
                    ) : (
                        <div className="w-32 h-24 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
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
                        accept="image/png, image/jpeg, image/webp"
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
