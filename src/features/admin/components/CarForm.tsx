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
import { X } from 'lucide-react';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const esquemaFormulario = z.object({
  marca: z.string().min(1, 'La marca es requerida.'),
  modelo: z.string().min(2, 'El modelo es requerido.'),
  anio: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  precio: z.coerce.number().min(0),
  tipo: z.enum(['Sedan', 'SUV', 'Sports', 'Truck', 'Hatchback']),
  color: z.string().min(1),
  cilindrosMotor: z.coerce.number().min(0),
  transmision: z.string().min(1),
  tipoCombustible: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  pasajeros: z.coerce.number().min(1),
  caracteristicas: z.string().optional(),
  imagenUrl: z.string().min(1, 'La imagen es requerida'),
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
    mode: 'onTouched',
    defaultValues: {
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      precio: 0,
      tipoCombustible: 'Gasoline',
      transmision: '',
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
          cilindrosMotor: 4,
          transmision: '',
          tipoCombustible: 'Gasoline',
          pasajeros: 5,
          caracteristicas: '',
          imagenUrl: '',
        });
        setPreview(null);
      }
      setSelectedFile(undefined);
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
      };
      reader.readAsDataURL(file);
    }
  };
  
  const alEnviar = (data: DatosFormulario) => {
    const datosAuto: Omit<Car, 'id'> = {
      ...data,
      caracteristicas: data.caracteristicas
        ? data.caracteristicas
            .split(',')
            .map((f) => f.trim())
            .filter((f) => f !== '')
        : [],
      imagenUrl: preview || data.imagenUrl,
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
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(alEnviar)} className="flex flex-col h-full overflow-hidden">
            <Tabs defaultValue="general" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="w-full">
                <TabsTrigger value="general" className="w-full">Datos del Vehículo</TabsTrigger>
                <TabsTrigger value="media" className="w-full">Multimedia y Extras</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-grow mt-4">
                  <TabsContent value="general" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="marca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Marca *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona una marca" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {marcas.map((m) => (
                                  <SelectItem key={`marca-${m.id ?? m.nombre}`} value={m.nombre}>
                                    {m.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="modelo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Civic, Corolla" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="anio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Año *</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="precio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Precio *</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Auto *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem key="tipo-Sedan" value="Sedan">Sedán</SelectItem>
                                <SelectItem key="tipo-SUV" value="SUV">SUV</SelectItem>
                                <SelectItem key="tipo-Sports" value="Sports">Deportivo</SelectItem>
                                <SelectItem key="tipo-Truck" value="Truck">Camioneta</SelectItem>
                                <SelectItem key="tipo-Hatchback" value="Hatchback">Hatchback</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona color" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colores.map((c) => (
                                  <SelectItem key={`color-${c.id ?? c.nombre}`} value={c.nombre}>
                                    {c.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cilindrosMotor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cilindros *</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="transmision"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Transmisión *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona transmisión" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {transmisiones.map((t) => (
                                  <SelectItem key={`transmision-${t.id ?? t.nombre}`} value={t.nombre}>
                                    {t.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="tipoCombustible"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Combustible *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona combustible" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem key="combustible-Gasoline" value="Gasoline">Gasolina</SelectItem>
                                <SelectItem key="combustible-Diesel" value="Diesel">Diésel</SelectItem>
                                <SelectItem key="combustible-Electric" value="Electric">Eléctrico</SelectItem>
                                <SelectItem key="combustible-Hybrid" value="Hybrid">Híbrido</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="pasajeros"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pasajeros *</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="p-4">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="caracteristicas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Características</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Ej: Aire acondicionado, GPS..." {...field} />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Separa cada característica con una coma
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-4 pt-4 border-t">
                        <FormLabel className="text-base font-semibold">Imagen del Auto *</FormLabel>
                        
                        <FormItem>
                          <FormLabel>Subir imagen</FormLabel>
                           <div className="flex items-center gap-4">
                            <FormControl>
                              <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Elegir archivo
                                <Input
                                  id="file-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleFileChange}
                                  className="hidden"
                                />
                              </label>
                            </FormControl>
                            {preview ? (
                              <div className="relative w-40 h-24 rounded-lg overflow-hidden border">
                                <img src={preview} alt="Vista previa" className="object-contain w-full h-full" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6"
                                  onClick={removeImage}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-40 h-24 flex items-center justify-center bg-muted rounded-lg text-xs text-muted-foreground">
                                Vista previa
                              </div>
                            )}

                          </div>
                          <FormMessage />
                        </FormItem>
                        <FormField
                            control={form.control}
                            name="imagenUrl"
                            render={({ field }) => (
                                <FormItem className='hidden'>
                                <FormLabel>URL de la Imagen</FormLabel>
                                <FormControl>
                                    <Input {...field} readOnly/>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                      </div>
                    </div>
                  </TabsContent>
              </ScrollArea>
            </Tabs>
            
            <DialogFooter className="pt-4 mt-auto border-t">
              <div className="flex justify-end w-full items-center gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">{auto ? 'Actualizar Auto' : 'Crear Auto'}</Button>
              </div>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
