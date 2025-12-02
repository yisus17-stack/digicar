
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
import { ArrowRight, ArrowLeft, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Car, Marca, Color, Transmision } from '@/core/types';

const esquemaFormulario = z.object({
  marca: z.string().min(1, 'La marca es requerida.'),
  modelo: z.string().min(2, 'El modelo es requerido.'),
  anio: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  precio: z.coerce.number().min(0),
  tipo: z.enum(['Sedan', 'SUV', 'Sports', 'Truck', 'Hatchback']),
  color: z.string().min(1),
  motor: z.string().optional(),
  cilindrosMotor: z.coerce.number().min(0),
  transmision: z.string().min(1),
  tipoCombustible: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  pasajeros: z.coerce.number().min(1),
  caracteristicas: z.string().optional(),
  imagenUrl: z.string().url('Debe ser una URL válida o una imagen subida.').min(1, 'La imagen es requerida'),
});


const formSteps = [
  {
    id: 'general',
    name: 'Datos del Vehículo',
    fields: ['marca', 'modelo', 'anio', 'precio', 'tipo', 'color', 'motor', 'cilindrosMotor', 'transmision', 'tipoCombustible', 'pasajeros'] as const
  },
  {
    id: 'media',
    name: 'Multimedia y Extras',
    fields: ['caracteristicas', 'imagenUrl'] as const
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
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      precio: 0,
      tipoCombustible: 'Gasoline',
      transmision: '',
      motor: '',
      caracteristicas: '',
      tipo: 'Sedan',
      cilindrosMotor: 4,
      color: '',
      pasajeros: 5,
      imagenUrl: '',
    },
  });

  useEffect(() => {
    if (estaAbierto) {
      if (auto) {
        form.reset({
          marca: auto.marca,
          modelo: auto.modelo,
          anio: auto.anio,
          precio: auto.precio,
          tipo: auto.tipo,
          color: auto.color,
          motor: auto.motor || '',
          cilindrosMotor: auto.cilindrosMotor,
          transmision: auto.transmision,
          tipoCombustible: auto.tipoCombustible,
          pasajeros: auto.pasajeros,
          caracteristicas: auto.caracteristicas.join(', '),
          imagenUrl: auto.imagenUrl || '',
        });
        setPreview(auto.imagenUrl || null);
      } else {
        form.reset({
          marca: '',
          modelo: '',
          anio: new Date().getFullYear(),
          precio: 0,
          tipo: 'Sedan',
          color: '',
          motor: '',
          cilindrosMotor: 4,
          transmision: '',
          tipoCombustible: 'Gasoline',
          pasajeros: 5,
          caracteristicas: '',
          imagenUrl: '',
        });
        setPreview(null);
        setSelectedFile(undefined);
      }
      setCurrentStep(0);
    }
  }, [auto, estaAbierto, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setPreview(imageUrl);
        form.setValue('imagenUrl', imageUrl, { shouldValidate: true });
        form.clearErrors('imagenUrl');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = async () => {
    const currentFields = formSteps[currentStep].fields;
    
    if (currentFields.length > 0) {
      const output = await form.trigger(currentFields);
      if (!output) return;
    }
    
    if (currentStep < formSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const alEnviar = (data: DatosFormulario) => {
    const datosAuto: Omit<Car, 'id'> = {
      ...data,
      caracteristicas: data.caracteristicas ? data.caracteristicas.split(',').map(f => f.trim()).filter(f => f !== '') : [],
      motor: data.motor || '',
    };
    
    alGuardar(datosAuto, selectedFile);
    alCambiarApertura(false);
  };

  const removeImage = () => {
    setPreview(null);
    setSelectedFile(undefined);
    form.setValue('imagenUrl', '', { shouldValidate: true });
  };
  
  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl flex flex-col h-[90vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
          <div className="flex w-full items-center justify-center p-4">
            {formSteps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                      currentStep === index ? "border-primary font-bold text-primary" : "border-muted-foreground",
                      currentStep > index ? "border-primary bg-primary text-primary-foreground" : ""
                    )}
                  >
                    {index + 1}
                  </div>
                  <p className={cn("mt-2 text-xs text-center", currentStep >= index ? "font-semibold text-primary" : "text-muted-foreground")}>
                    {step.name}
                  </p>
                </div>
                {index < formSteps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-4", currentStep > index ? "bg-primary" : "bg-muted-foreground")}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(alEnviar)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && currentStep < formSteps.length - 1) {
                    e.preventDefault();
                    handleNext();
                }
                }}
            >
                <ScrollArea className="h-[50vh] p-4">
                {currentStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="marca" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Marca *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {marcas.map((m) => (
                                <SelectItem key={m.id} value={m.nombre}>
                                  {m.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="modelo" render={({ field }) => (<FormItem><FormLabel>Modelo *</FormLabel><FormControl><Input placeholder="Ej: Civic, Corolla" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="anio" render={({ field }) => (<FormItem><FormLabel>Año *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="precio" render={({ field }) => (<FormItem><FormLabel>Precio *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="tipo" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tipo de Auto *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tipo" /></SelectTrigger></FormControl>
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
                        <FormLabel>Color *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona color" /></SelectTrigger></FormControl>
                            <SelectContent>{colores.map(c => <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="motor" render={({ field }) => (<FormItem><FormLabel>Motor</FormLabel><FormControl><Input placeholder="Ej: 2.0L Turbo" {...field} /></FormControl><FormMessage /></FormMessage>)}/>
                    <FormField control={form.control} name="cilindrosMotor" render={({ field }) => (<FormItem><FormLabel>Cilindros *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="transmision" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Transmisión *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona transmisión" /></SelectTrigger></FormControl>
                            <SelectContent>{transmisiones.map(t => <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="tipoCombustible" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Combustible *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona combustible" /></SelectTrigger></FormControl>
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
                    <FormField control={form.control} name="pasajeros" render={({ field }) => (<FormItem><FormLabel>Pasajeros *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                )}
                {currentStep === 1 && (
                    <div className="space-y-6">
                    <FormField control={form.control} name="caracteristicas" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Características</FormLabel>
                        <FormControl><Textarea placeholder="Ej: Aire acondicionado, GPS..." {...field} /></FormControl>
                        <p className="text-sm text-muted-foreground">Separa cada característica con una coma</p>
                        <FormMessage />
                        </FormItem>
                    )}/>
                    <div className="space-y-4 pt-4 border-t">
                        <div>
                        <FormLabel className="text-base font-semibold">Imagen del Auto *</FormLabel>
                        <p className="text-sm text-muted-foreground mt-1">Sube una foto o pega la URL de la imagen.</p>
                        </div>
                        <FormItem>
                        <FormLabel>Subir imagen</FormLabel>
                        <FormControl><Input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} /></FormControl>
                        <FormMessage />
                        </FormItem>
                        <FormField control={form.control} name="imagenUrl" render={({ field }) => (
                        <FormItem>
                            <FormLabel>O pegar URL de la imagen</FormLabel>
                            <FormControl>
                            <Input {...field} placeholder="https://example.com/imagen.png" onBlur={(e) => { field.onBlur(); setPreview(e.target.value); setSelectedFile(undefined); }} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}/>
                        {preview && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                            <Image src={preview} alt="Vista previa" fill className="object-contain" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={removeImage}><X className="h-4 w-4" /></Button>
                        </div>
                        )}
                    </div>
                    </div>
                )}
                </ScrollArea>
                <DialogFooter className="pt-4 mt-auto border-t">
                    <div className='flex justify-between w-full items-center'>
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

    