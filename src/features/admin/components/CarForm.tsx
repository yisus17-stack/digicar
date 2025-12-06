'use client';
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { X, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import type { Car, Marca, Color, Transmision, CarVariant } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const variantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, 'El color es requerido.'),
  precio: z.coerce.number().min(1, 'El precio debe ser mayor a 0.'),
  imagenUrl: z.string().min(1, 'La imagen es requerida.'),
  file: z.instanceof(File).optional(),
});

const esquemaFormulario = z.object({
  marca: z.string().min(1, 'La marca es requerida.'),
  modelo: z.string().min(2, 'El modelo es requerido.'),
  anio: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  tipo: z.enum(['Sedan', 'SUV', 'Sports', 'Truck', 'Hatchback']),
  cilindrosMotor: z.coerce.number().min(0),
  transmision: z.string().min(1),
  tipoCombustible: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  pasajeros: z.coerce.number().min(1),
  caracteristicas: z.string().optional(),
  variantes: z.array(variantSchema).min(1, "Debes añadir al menos una variante de color."),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PropsFormularioAuto {
  estaAbierto: boolean;
  alCambiarApertura: (open: boolean) => void;
  auto: Car | null;
  alGuardar: (auto: Omit<Car, 'id'>, files: (File | undefined)[]) => void;
  marcas: Marca[];
  colores: Color[];
  transmisiones: Transmision[];
  isSaving: boolean;
}

export default function FormularioAuto({
  estaAbierto,
  alCambiarApertura,
  auto,
  alGuardar,
  marcas,
  colores,
  transmisiones,
  isSaving,
}: PropsFormularioAuto) {
  
  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    mode: 'onTouched',
    defaultValues: {
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      tipo: 'Sedan',
      cilindrosMotor: 4,
      transmision: '',
      tipoCombustible: 'Gasoline',
      pasajeros: 5,
      caracteristicas: '',
      variantes: [],
    },
  });

  const { fields, append, remove, update, replace } = useFieldArray({
    control: form.control,
    name: "variantes"
  });

  useEffect(() => {
    if (estaAbierto) {
      if (auto) {
        form.reset({
          marca: auto.marca,
          modelo: auto.modelo,
          anio: auto.anio,
          tipo: auto.tipo,
          cilindrosMotor: auto.cilindrosMotor,
          transmision: auto.transmision,
          tipoCombustible: auto.tipoCombustible,
          pasajeros: auto.pasajeros,
          caracteristicas: auto.caracteristicas.join(', '),
        });
        replace(auto.variantes || []);
      } else {
        form.reset({
          marca: '',
          modelo: '',
          anio: new Date().getFullYear(),
          tipo: 'Sedan',
          cilindrosMotor: 4,
          transmision: '',
          tipoCombustible: 'Gasoline',
          pasajeros: 5,
          caracteristicas: '',
        });
        replace([]);
      }
    }
  }, [auto, estaAbierto, form, replace]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        update(index, { ...fields[index], imagenUrl: imageUrl, file: file });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const alEnviar = (data: DatosFormulario) => {
    const files = data.variantes.map(v => v.file);
    const datosAuto: Omit<Car, 'id'> = {
      ...data,
      caracteristicas: data.caracteristicas
        ? data.caracteristicas
            .split(',')
            .map((f) => f.trim())
            .filter((f) => f !== '')
        : [],
      variantes: data.variantes.map(({ file, ...rest }) => ({
        ...rest,
        id: rest.id || `new_${Date.now()}_${Math.random()}`,
      })),
    };
    alGuardar(datosAuto, files);
  };
  
  const addVariant = () => {
    append({
        id: `new_${Date.now()}_${Math.random()}`,
        color: colores[0]?.nombre || 'Blanco',
        precio: 0,
        imagenUrl: '',
    });
  }

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl flex flex-col h-[90vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="flex flex-col flex-grow overflow-hidden">
            <Tabs defaultValue="general" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="general">Datos del Vehículo</TabsTrigger>
                <TabsTrigger value="variantes">Colores y Precios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="flex-grow overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField name="marca" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger></FormControl>
                          <SelectContent>{marcas.map((m) => (<SelectItem key={`marca-${m.id ?? m.nombre}`} value={m.nombre}>{m.nombre}</SelectItem>))}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField name="modelo" render={({ field }) => (<FormItem><FormLabel>Modelo *</FormLabel><FormControl><Input placeholder="Ej: Civic, Corolla" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="anio" render={({ field }) => (<FormItem><FormLabel>Año *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField name="tipo" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Auto *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona tipo" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Sedan">Sedán</SelectItem><SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Sports">Deportivo</SelectItem><SelectItem value="Truck">Camioneta</SelectItem>
                            <SelectItem value="Hatchback">Hatchback</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField name="cilindrosMotor" render={({ field }) => (<FormItem><FormLabel>Cilindros *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="transmision" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmisión *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona transmisión" /></SelectTrigger></FormControl>
                          <SelectContent>{transmisiones.map((t) => (<SelectItem key={`transmision-${t.id ?? t.nombre}`} value={t.nombre}>{t.nombre}</SelectItem>))}</SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField name="tipoCombustible" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Combustible *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona combustible" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Gasoline">Gasolina</SelectItem><SelectItem value="Diesel">Diésel</SelectItem>
                            <SelectItem value="Electric">Eléctrico</SelectItem><SelectItem value="Hybrid">Híbrido</SelectItem>
                          </SelectContent>
                        </Select><FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField name="pasajeros" render={({ field }) => (<FormItem><FormLabel>Pasajeros *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField name="caracteristicas" render={({ field }) => (
                    <FormItem><FormLabel>Características</FormLabel>
                      <FormControl><Textarea placeholder="Ej: Aire acondicionado, GPS..." {...field} /></FormControl>
                      <p className="text-sm text-muted-foreground">Separa cada característica con una coma</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="variantes" className="flex-grow flex flex-col p-1 overflow-hidden">
                 <div className="flex-grow overflow-y-auto p-3 -m-3">
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="border p-4 rounded-lg space-y-4 relative">
                            <h4 className="font-semibold">Variante {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name={`variantes.${index}.color`} render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona color" /></SelectTrigger></FormControl>
                                            <SelectContent>{colores.map((c) => (<SelectItem key={`color-var-${index}-${c.id ?? c.nombre}`} value={c.nombre}>{c.nombre}</SelectItem>))}</SelectContent>
                                        </Select><FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name={`variantes.${index}.precio`} render={({ field }) => (
                                    <FormItem><FormLabel>Precio *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <FormItem>
                                <FormLabel>Imagen *</FormLabel>
                                <div className="flex items-center gap-4">
                                <FormControl>
                                    <label htmlFor={`file-upload-${index}`} className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                        Elegir archivo
                                        <Input id={`file-upload-${index}`} type="file" accept="image/*" onChange={(e) => handleFileChange(e, index)} className="hidden"/>
                                    </label>
                                </FormControl>
                                {fields[index].imagenUrl ? (
                                    <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
                                        <img src={fields[index].imagenUrl} alt="Vista previa" className="object-contain w-full h-full" />
                                    </div>
                                ) : (
                                    <div className="w-40 h-24 flex items-center justify-center bg-muted rounded-lg text-xs text-muted-foreground">Vista previa</div>
                                )}
                                </div>
                                <FormMessage />
                            </FormItem>
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <FormMessage>{form.formState.errors.variantes?.message || (form.formState.errors.variantes as any)?.root?.message}</FormMessage>
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <Button type="button" variant="outline" onClick={addVariant} className="w-full">
                      <PlusCircle className="mr-2 h-4 w-4" /> Añadir Variante
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="pt-4 mt-auto border-t">
              <div className="flex justify-end w-full items-center gap-2">
                <DialogClose asChild><Button type="button" variant="secondary" disabled={isSaving}>Cancelar</Button></DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {auto ? 'Actualizar Auto' : 'Crear Auto'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
