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
  precio: z.coerce.number().min(1, 'El precio es requerido.'),
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
  tipoCombustible: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid'], { required_error: 'Debes seleccionar el tipo de combustible.' }),
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
    defaultValues: {
      marca: '',
      modelo: '',
      anio: '',
      tipo: '',
      cilindrosMotor: 0,
      transmision: '',
      tipoCombustible: '' as any,
      pasajeros: 0,
      caracteristicas: '',
      variantes: [],
    },
  });

  const { control, getValues, setValue }