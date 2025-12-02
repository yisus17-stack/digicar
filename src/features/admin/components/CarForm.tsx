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
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';


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
  imageUrl: z.string().url("Debe ser una URL válida.").optional().or(z.literal('')),
});

const formSteps = [
    { id: 'general', name: 'General', fields: ['brand', 'model', 'year', 'price', 'type', 'color'] },
    { id: 'specs', name: 'Especificaciones', fields: ['mileage', 'horsepower', 'engine', 'engineCylinders', 'transmission', 'fuelType', 'passengers'] },
    { id: 'media', name: 'Multimedia', fields: ['features', 'imageUrl'] }
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
        setPreview(reader.result as string);
        form.setValue('imageUrl', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleNext = async () => {
    const fields = formSteps[currentStep].fields;
    const output = await form.trigger(fields as any, { shouldFocus: true });
    if (!output) return;
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
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
  
  const isStepValid = (stepIndex: number) => {
    // For the last step, since all fields are optional, we consider it "valid" for UI purposes if we are on it.
    if (stepIndex === formSteps.length -1) {
        const fields = formSteps[stepIndex].fields;
        const values = form.getValues();
        // Check if at least one optional field has some value
        return fields.some(field => {
            const value = values[field as keyof typeof values];
            return value !== '' && value !== undefined && value !== null;
        });
    }
    
    const fields = formSteps[stepIndex].fields;
    const { formState } = form;
    
    // Check if all fields in the step have been touched and are valid
    return fields.every(field => 
      formState.touchedFields[field as keyof typeof formState.touchedFields] && !formState.errors[field as keyof typeof formState.errors]
    );
  }

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
           <div className="flex items-center justify-center gap-8 py-4">
                {formSteps.map((step, index) => {
                    const isActive = currentStep === index;
                    const isCompleted = isStepValid(index);
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2">
                           <div className={cn("flex items-center justify-center w-8 h-8 rounded-full border-2", 
                                isActive ? "border-primary" : "border-muted",
                                isCompleted && !isActive && "bg-primary text-primary-foreground border-primary"
                            )}>
                               <span className={cn(isActive && 'text-primary')}>{index + 1}</span>
                           </div>
                           <p className={cn("text-sm", isActive ? 'text-primary' : 'text-muted-foreground')}>{step.name}</p>
                        </div>
                    );
                })}
            </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)}>
            <ScrollArea className="h-[50vh] p-4">

            {currentStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-300">
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
                    <FormItem> <FormLabel>Modelo</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
                <FormField control={form.control} name="year" render={({ field }) => (
                    <FormItem> <FormLabel>Año</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem>
                )}/>
                <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem> <FormLabel>Precio</FormLabel> <FormControl><Input type="number" {...field} /></FormControl> <FormMessage /> </FormItem>
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
            )}
            
            {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in-50 duration-300">
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
                        <FormItem><FormLabel>Pasajeros</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            )}

            {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in-50 duration-300">
                    <FormField control={form.control} name="features" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Características (separadas por coma)</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormItem>
                        <FormLabel>Subir Imagen del Auto</FormLabel>
                        <FormControl><Input type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel>O pegar URL de la imagen</FormLabel>
                            <FormControl><Input {...field} onBlur={(e) => { field.onBlur(); setPreview(e.target.value); setSelectedFile(undefined); }} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    
                    {preview && (
                        <div className="mt-4">
                            <Image src={preview} alt="Vista previa del auto" width={200} height={150} className="rounded-md object-cover" />
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
                        <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                        {currentStep < formSteps.length - 1 ? (
                            <Button type="button" onClick={handleNext}>
                                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit">Guardar Cambios</Button>
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
