'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Car as IconoAuto } from 'lucide-react';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import FormularioAuto from './CarForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFirestore, useStorage } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { subirImagen } from '@/core/services/storageService';
import Image from 'next/image';

interface TablaAutosProps {
  autos: Car[];
  marcas: Marca[];
  colores: Color[];
  transmisiones: Transmision[];
}

export default function TablaAutos({ autos: autosIniciales, marcas, colores, transmisiones }: TablaAutosProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [autoSeleccionado, setAutoSeleccionado] = useState<Car | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [autoAEliminar, setAutoAEliminar] = useState<string | null>(null);
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const manejarAnadir = () => {
    setAutoSeleccionado(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (auto: Car) => {
    setAutoSeleccionado(auto);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (autoId: string) => {
    setAutoAEliminar(autoId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!autoAEliminar) return;
    const autoRef = doc(firestore, 'cars', autoAEliminar);
    deleteDoc(autoRef)
      .then(() => {
        toast({ title: "Auto eliminado", description: "El auto se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: autoRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setAutoAEliminar(null);
        setEstaAlertaAbierta(false);
      });
  };

  const manejarGuardar = async (data: Omit<Car, 'id'>, nuevoArchivoImagen?: File) => {
    try {
        let imageUrl = data.imageUrl || '';

        if (nuevoArchivoImagen) {
            const toastId = toast({ title: 'Subiendo imagen...', description: 'Por favor, espera.' });
            const idEntidad = autoSeleccionado ? autoSeleccionado.id : doc(collection(firestore, 'cars')).id;
            imageUrl = await subirImagen(storage, nuevoArchivoImagen, `cars/${idEntidad}`);
            toastId.dismiss();
        }

        const datosAuto = { ...data, imageUrl };

        if (autoSeleccionado) {
            const autoRef = doc(firestore, 'cars', autoSeleccionado.id);
            updateDoc(autoRef, datosAuto).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: autoRef.path,
                requestResourceData: datosAuto,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Auto actualizado", description: "Los cambios se guardaron correctamente." });
        } else {
            const coleccionRef = collection(firestore, 'cars');
            addDoc(coleccionRef, datosAuto).catch(error => {
              const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: coleccionRef.path,
                requestResourceData: datosAuto,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Auto añadido", description: "El nuevo auto se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Autos</h1>
            <Button onClick={manejarAnadir}>Añadir Auto</Button>
        </div>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="hidden md:table-cell">Año</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {autosIniciales.map(auto => (
                    <TableRow key={auto.id}>
                    <TableCell>
                      {auto.imageUrl ? (
                        <Image src={auto.imageUrl} alt={`${auto.brand} ${auto.model}`} width={64} height={48} className="rounded-md object-cover" />
                      ) : (
                        <div className="w-16 h-12 flex items-center justify-center bg-muted rounded-md">
                          <IconoAuto className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{auto.brand}</TableCell>
                    <TableCell>{auto.model}</TableCell>
                    <TableCell className="hidden md:table-cell">{auto.year}</TableCell>
                    <TableCell className="text-right">${auto.price.toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => manejarEditar(auto)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => auto.id && confirmarEliminar(auto.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <FormularioAuto 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={setEstaFormularioAbierto}
            auto={autoSeleccionado}
            alGuardar={manejarGuardar}
            marcas={marcas}
            colores={colores}
            transmisiones={transmisiones}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={setEstaAlertaAbierta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el auto de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setAutoAEliminar(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={manejarEliminar} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
