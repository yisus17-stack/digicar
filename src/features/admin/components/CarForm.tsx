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
import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

const esquemaFormulario = z.object({
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

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioAuto {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  auto: Car | null;
  alGuardar: (auto: Omit<Car, 'id'>, nuevoArchivoImagen?: File) => void;
  marcas: Marca[];
  colores: Color[];
  transmisiones: Transmision[];
}

export default function FormularioAuto({ estaAbierto, alCambiarApertura, auto, alGuardar, marcas, colores, transmisiones }: PropsFormularioAuto) {
  const [vistaPreviaImagen, setVistaPreviaImagen] = useState<string | null>(null);
  const [nuevoArchivoImagen, setNuevoArchivoImagen] = useState<File | undefined>(undefined);
  const refInputArchivo = useRef<HTMLInputElement>(null);

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
          setVistaPreviaImagen(auto.imageUrl || null);
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
          setVistaPreviaImagen(null);
        }
        setNuevoArchivoImagen(undefined);
    }
  }, [auto, form, estaAbierto]);

  const alEnviar = (data: DatosFormulario) => {
    const datosAuto = {
        ...data,
        features: data.features ? data.features.split(',').map(f => f.trim()) : [],
    };
    alGuardar(datosAuto, nuevoArchivoImagen);
    alCambiarApertura(false);
  };
  
  const manejarCambioArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNuevoArchivoImagen(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVistaPreviaImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className='flex flex-col flex-grow overflow-hidden'>
             <ScrollArea className="flex-grow pr-6 -mr-6">
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                          control={form.control}
                          name="brand"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Marca</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Selecciona una marca" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          {marcas.map((brand) => (
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
                      <FormField control={form.control} name="engine" render={({ field }) => (
                          <FormItem><FormLabel>Motor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="engineCylinders" render={({ field }) => (
                          <FormItem><FormLabel>Cilindros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField
                          control={form.control}
                          name="transmission"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Transmisión</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Selecciona una transmisión" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          {transmisiones.map((transmission) => (
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
                      <FormField control={form.control} name="fuelType" render={({ field }) => (
                          <FormItem><FormLabel>Combustible</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Gasoline">Gasolina</SelectItem><SelectItem value="Diesel">Diésel</SelectItem><SelectItem value="Electric">Eléctrico</SelectItem><SelectItem value="Hybrid">Híbrido</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="type" render={({ field }) => (
                          <FormItem><FormLabel>Tipo de Auto</FormLabel><Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                              <SelectContent><SelectItem value="Sedan">Sedán</SelectItem><SelectItem value="SUV">SUV</SelectItem><SelectItem value="Sports">Deportivo</SelectItem><SelectItem value="Truck">Camioneta</SelectItem><SelectItem value="Hatchback">Hatchback</SelectItem></SelectContent>
                          </Select><FormMessage /></FormItem>
                      )}/>
                      <FormField
                          control={form.control}
                          name="color"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Color</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Selecciona un color" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          {colores.map((color) => (
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
                      <FormField control={form.control} name="passengers" render={({ field }) => (
                          <FormItem><FormLabel>Pasajeros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                  </div>
                  <FormField control={form.control} name="features" render={({ field }) => (
                      <FormItem><FormLabel>Características (separadas por coma)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormItem>
                      <FormLabel>Imagen del Auto</FormLabel>
                      <div className="flex items-center gap-4">
                          {vistaPreviaImagen ? (
                              <Image src={vistaPreviaImagen} alt="Vista previa del auto" width={128} height={96} className="rounded-md object-cover border p-1" />
                          ) : (
                              <div className="w-32 h-24 flex items-center justify-center bg-muted rounded-md text-muted-foreground">
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
                              accept="image/png, image/jpeg, image/webp"
                          />
                      </div>
                  </FormItem>
                </div>
            </ScrollArea>
            <DialogFooter className='pt-4 mt-4 border-t'>
                <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
