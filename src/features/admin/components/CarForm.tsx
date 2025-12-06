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
import { X, Loader2, PlusCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Car, Marca, Color, Transmision, CarVariant } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

const variantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, 'El color es requerido.'),
  precio: z.coerce.number().min(0, 'El precio es requerido.'),
  imagenUrl: z.string().min(1, 'La imagen es requerida.'),
  file: z.instanceof(File).optional(),
});

const esquemaFormulario = z.object({
  marca: z.string().min(1, 'La marca es requerida.'),
  modelo: z.string().min(2, 'El modelo es requerido.'),
  anio: z.string({ required_error: 'El año es requerido.' }).min(4, 'El año es requerido.'),
  tipo: z.string({ required_error: 'El tipo es requerido.' }).min(1, 'El tipo es requerido.'),
  cilindrosMotor: z.coerce.number().min(2, 'Debes seleccionar los cilindros.'),
  transmision: z.string().min(1, 'La transmisión es requerida.'),
  tipoCombustible: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid'], { required_error: 'El tipo de combustible es requerido.' }),
  pasajeros: z.coerce.number().min(1, 'El número de pasajeros es requerido.'),
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
  
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    mode: 'onTouched',
    defaultValues: {
      marca: '',
      modelo: '',
      anio: '',
      tipo: '',
      cilindrosMotor: 0,
      transmision: '',
      tipoCombustible: 'Gasoline',
      pasajeros: 5,
      caracteristicas: '',
      variantes: [],
    },
  });

  const { control, getValues, setValue } = form;

  const { fields, append, remove, update, replace } = useFieldArray({
    control: control,
    name: "variantes"
  });

  useEffect(() => {
    if (estaAbierto) {
      if (auto) {
        form.reset({
          marca: auto.marca,
          modelo: auto.modelo,
          anio: String(auto.anio),
          tipo: auto.tipo,
          cilindrosMotor: auto.cilindrosMotor,
          transmision: auto.transmision,
          tipoCombustible: auto.tipoCombustible,
          pasajeros: auto.pasajeros,
          caracteristicas: auto.caracteristicas.join(', '),
        });
        const mappedVariants = auto.variantes?.map(v => ({ ...v, precio: v.precio ?? 0 })) || [];
        replace(mappedVariants);
      } else {
        form.reset({
          marca: '',
          modelo: '',
          anio: '',
          tipo: '',
          cilindrosMotor: 0,
          transmision: '',
          tipoCombustible: 'Gasoline',
          pasajeros: 5,
          caracteristicas: '',
          variantes: [],
        });
        replace([]);
      }
      setActiveVariantIndex(0);
    }
  }, [auto, estaAbierto, form, replace]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      const currentValues = getValues();
      const currentVariant = currentValues.variantes[index];

      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        const updatedVariant = {
          ...currentVariant,
          imagenUrl: imageUrl,
          file: file
        };
        update(index, updatedVariant);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const alEnviar = (data: DatosFormulario) => {
    const files = data.variantes.map(v => v.file);
    const datosAuto: Omit<Car, 'id'> = {
      ...data,
      anio: Number(data.anio),
      tipo: data.tipo as any,
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
    const newVariant = {
        id: `new_${Date.now()}_${Math.random()}`,
        color: '',
        precio: '' as any,
        imagenUrl: '',
    };
    append(newVariant);
    setActiveVariantIndex(fields.length); // Switch to the new variant
  }

  const removeVariant = (index: number) => {
    Swal.fire({
      title: '¿Eliminar variante?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#595c97',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        remove(index);
        if (activeVariantIndex >= index && activeVariantIndex > 0) {
          setActiveVariantIndex(activeVariantIndex - 1);
        } else if (fields.length === 1) {
            setActiveVariantIndex(0);
        }
      }
    });
  }

  const navigateVariant = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
        setActiveVariantIndex(prev => Math.min(prev + 1, fields.length - 1));
    } else {
        setActiveVariantIndex(prev => Math.max(prev - 1, 0));
    }
  }

  const years = Array.from({ length: new Date().getFullYear() - 1969 }, (_, i) => new Date().getFullYear() + 1 - i);

  return (
    <Dialog open={estaAbierto} onOpenChange={alCambiarApertura}>
      <DialogContent className="sm:max-w-3xl flex flex-col h-[90vh] max-h-[800px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{auto ? 'Editar Auto' : 'Añadir Auto'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="auto-form" onSubmit={form.handleSubmit(alEnviar)} className="flex-grow flex flex-col overflow-hidden">
            <Tabs defaultValue="general" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="general">Datos del Vehículo</TabsTrigger>
                <TabsTrigger value="variantes">Colores y Precios</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="flex-grow overflow-y-auto py-3 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  <FormField name="marca" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una marca" /></SelectTrigger></FormControl>
                        <SelectContent>{marcas.map((m) => (<SelectItem key={`marca-${m.id ?? m.nombre}`} value={m.nombre}>{m.nombre}</SelectItem>))}</SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="modelo" control={form.control} render={({ field }) => (<FormItem><FormLabel>Modelo *</FormLabel><FormControl><Input placeholder="Ej: Civic, Corolla" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField name="anio" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar año" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map(year => (
                            <SelectItem key={year} value={String(year)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="tipo" control={form.control} render={({ field }) => (
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
                  )} />
                  <FormField name="cilindrosMotor" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cilindros *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value === 0 ? '' : field.value)}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cilindros" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {[2, 3, 4, 6, 8, 12].map(c => (
                                    <SelectItem key={c} value={String(c)}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="transmision" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transmisión *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecciona transmisión" /></SelectTrigger></FormControl>
                        <SelectContent>{transmisiones.map((t) => (<SelectItem key={`transmision-${t.id ?? t.nombre}`} value={t.nombre}>{t.nombre}</SelectItem>))}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="tipoCombustible" control={form.control} render={({ field }) => (
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
                  )} />
                  <FormField name="pasajeros" control={form.control} render={({ field }) => (<FormItem><FormLabel>Pasajeros *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField
                  control={form.control}
                  name="caracteristicas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Características</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Ej: Aire acondicionado, GPS..." {...field} />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">Separa cada característica con una coma</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="variantes" className="flex-grow flex flex-col p-4 overflow-hidden">
                <div className="flex-grow overflow-y-auto pr-2">
                  {fields.length > 0 && (
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button type="button" variant="ghost" size="icon" onClick={() => navigateVariant('prev')} disabled={activeVariantIndex === 0}>
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <div className="flex items-center gap-2">
                        {fields.map((_, index) => (
                          <button key={`dot-${index}`} type="button" onClick={() => setActiveVariantIndex(index)} className={cn("h-2 w-2 rounded-full transition-colors", activeVariantIndex === index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground')}></button>
                        ))}
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => navigateVariant('next')} disabled={activeVariantIndex === fields.length - 1}>
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                  
                  {fields.map((field, index) => (
                    <div key={field.id} className={cn("border p-4 rounded-lg space-y-4", activeVariantIndex === index ? 'block' : 'hidden')}>
                      <div className='flex justify-between items-center'>
                        <h4 className="font-semibold">Variante {index + 1}</h4>
                        {fields.length > 0 && (
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeVariant(index)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar Variante
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name={`variantes.${index}.color`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Selecciona color" /></SelectTrigger></FormControl>
                              <SelectContent>{colores.map((c) => (<SelectItem key={`color-var-${index}-${c.id ?? c.nombre}`} value={c.nombre}>{c.nombre}</SelectItem>))}</SelectContent>
                            </Select>
                            <FormMessage className="h-5" />
                          </FormItem>
                        )}/>
                        <FormField control={form.control} name={`variantes.${index}.precio`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio *</FormLabel>
                            <FormControl><Input type="number" {...field} value={field.value ?? ''}/></FormControl>
                            <FormMessage className="h-5" />
                          </FormItem>
                        )}/>
                      </div>
                      <FormField
                        control={form.control}
                        name={`variantes.${index}.imagenUrl`}
                        render={({ field: imageField }) => (
                          <FormItem>
                            <FormLabel>Imagen *</FormLabel>
                            <div className="flex items-center gap-4">
                              <FormControl>
                                <label htmlFor={`file-upload-${index}`} className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                  Elegir archivo
                                  <Input id={`file-upload-${index}`} type="file" accept="image/*" onChange={(e) => handleFileChange(e, index)} className="hidden"/>
                                </label>
                              </FormControl>
                              {imageField.value ? (
                                <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
                                  <img src={imageField.value} alt="Vista previa" className="object-cover w-full h-full" />
                                </div>
                              ) : (
                                <div className="w-40 h-24 flex items-center justify-center bg-muted rounded-lg text-xs text-muted-foreground">Vista previa</div>
                              )}
                            </div>
                            <FormMessage className="h-5"/>
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex-shrink-0 pt-4 mt-2">
                  <Button type="button" variant="outline" onClick={addVariant} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nueva Variante
                  </Button>
                </div>

                <FormMessage className="h-5 pt-2 flex-shrink-0">{form.formState.errors.variantes?.root?.message}</FormMessage>

              </TabsContent>
            </Tabs>
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary" disabled={isSaving}>Cancelar</Button></DialogClose>
          <Button type="submit" form="auto-form" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {auto ? 'Actualizar Auto' : 'Crear Auto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
