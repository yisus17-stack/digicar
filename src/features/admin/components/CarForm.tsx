'use client';
import React, { useEffect, useState } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Car, Marca, Color, Transmision } from '@/core/types';

// Modifica el esquema para que imageUrl sea completamente opcional
const esquemaFormulario = z.object({
  brand: z.string().min(1, 'La marca es requerida.'),
  model: z.string().min(2, 'El modelo es requerido.'),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price: z.coerce.number().min(0),
  type: z.enum(['Sedan', 'SUV', 'Sports', 'Truck', 'Hatchback']),
  color: z.string().min(1),
  mileage: z.coerce.number().min(0),
  horsepower: z.coerce.number().min(0),
  engine: z.string().optional(),
  engineCylinders: z.coerce.number().min(0),
  transmission: z.string().min(1),
  fuelType: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  passengers: z.coerce.number().min(1),
  features: z.string().optional(),
  imageUrl: z.string().min(1, "La imagen es obligatoria."),
});

const formSteps = [
  { 
    id: 'data', 
    name: 'Datos del Vehículo', 
    fields: ['brand', 'model', 'year', 'price', 'type', 'color', 'mileage', 'horsepower', 'engine', 'engineCylinders', 'transmission', 'fuelType', 'passengers'] 
  },
  { 
    id: 'media', 
    name: 'Multimedia y Extras', 
    fields: ['features', 'imageUrl']
  }
] as const;


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
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    mode: 'onTouched',
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
          engine: auto.engine || '',
          features: auto.features.join(', '),
          imageUrl: auto.imageUrl || '',
        });
        setPreview(auto.imageUrl || null);
      } else {
        form.reset({
          brand: '', model: '', year: new Date().getFullYear(), price: 0,
          mileage: 0, fuelType: 'Gasoline', transmission: '',
          engine: '', horsepower: 0, features: '', type: 'Sedan',
          engineCylinders: 4, color: '', passengers: 5, imageUrl: ''
        });
        setPreview(null);
      }
      setCurrentStep(0);
      setSelectedFile(undefined);
    }
  }, [auto, form, estaAbierto]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreview(imageUrl);
        form.setValue('imageUrl', imageUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    const fields = formSteps[currentStep].fields;
    
    const isValid = await form.trigger(fields as (keyof DatosFormulario)[]);
    
    if (!isValid) return;
    
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const alEnviar = async (data: DatosFormulario) => {
    const isValid = await form.trigger();
    if (!isValid) {
      // Si imageUrl falla la validación, llevar al paso 2
      if (form.getFieldState('imageUrl').invalid) {
        setCurrentStep(1);
      }
      return;
    }

    const datosAuto: Omit<Car, 'id'> = {
      ...data,
      engine: data.engine ?? '',
      features: data.features ? data.features.split(',').map(f => f.trim()) : [],
      imageUrl: data.imageUrl,
    };
    
    alGuardar(datosAuto, selectedFile);
    alCambiarApertura(false);
  };

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle>{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
          <div className="relative w-full px-6 py-4">
            <div className="flex justify-between items-center">
              {formSteps.map((step, index) => {
                const isActive = currentStep === index;
                const isCompleted = currentStep > index;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1 z-10">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                        isActive ? "bg-primary border-primary text-primary-foreground" : "",
                        isCompleted ? "bg-primary border-primary text-primary-foreground" : "bg-background border-muted-foreground text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <p className={cn(
                        "text-xs text-center mt-1",
                        isActive || isCompleted ? "text-primary font-semibold" : "text-muted-foreground"
                      )}>
                        {step.name}
                      </p>
                    </div>
                    {index < formSteps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-2",
                        isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(alEnviar)}
            className="flex-1 flex flex-col"
          >
            <ScrollArea className="h-[50vh] p-4">
              {currentStep === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="brand" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger></FormControl>
                          <SelectContent>{marcas.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField control={form.control} name="model" render={({ field }) => (
                      <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="year" render={({ field }) => (
                      <FormItem><FormLabel>Año</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
                          <SelectContent>{colores.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
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
                    <FormField control={form.control} name="transmission" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmisión</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona transmisión" /></SelectTrigger></FormControl>
                          <SelectContent>{transmisiones.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
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
                      <FormItem><FormLabel>Pasajeros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
              )}

              {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField control={form.control} name="features" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Características (separadas por coma)</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    
                    <FormField 
                      control={form.control} 
                      name="imageUrl" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Imagen del Auto</FormLabel>
                          <FormDescription>Sube una imagen desde tu computadora.</FormDescription>
                          <FormControl>
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange}
                              className='mt-2'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                      
                    {preview && (
                        <div className="mt-6">
                        <FormLabel>Vista previa:</FormLabel>
                        <div className="mt-2">
                            <Image 
                            src={preview} 
                            alt="Vista previa del auto" 
                            width={300} 
                            height={200} 
                            className="rounded-md object-cover border"
                            />
                        </div>
                        </div>
                    )}
                  </div>
              )}
            </ScrollArea>
            <DialogFooter className="pt-4 mt-auto border-t">
              <div className='flex justify-between w-full'>
                <div>
                  {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  {currentStep < formSteps.length - 1 ? (
                    <Button type="button" onClick={handleNext}>
                      Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button type="submit">
                      {auto ? 'Actualizar Auto' : 'Crear Auto'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
