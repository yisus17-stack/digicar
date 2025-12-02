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
import { Edit, Trash2, Car as IconoAuto } from 'lucide-react';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import FormularioAuto from './CarForm';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogCancel
} from "@/components/ui/alert-dialog"
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';
import { uploadImage } from '@/core/services/storageService';

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
    const autoRef = doc(firestore, 'autos', autoAEliminar);
    try {
        await deleteDoc(autoRef);
        toast({ title: "Auto eliminado", description: "El auto se ha eliminado correctamente." });
    } catch (error) {
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: autoRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    } finally {
        alCambiarAperturaAlerta(false);
    }
  };

  const manejarGuardar = async (datosAuto: Omit<Car, 'id'>, file?: File) => {
    try {
        let finalCarData: any = { ...datosAuto };

        if (file) {
            const imageUrl = await uploadImage(file);
            finalCarData.imagenUrl = imageUrl;
        }

        if (autoSeleccionado) {
            const autoRef = doc(firestore, 'autos', autoSeleccionado.id);
            updateDoc(autoRef, finalCarData).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: autoRef.path,
                requestResourceData: finalCarData,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Auto actualizado", description: "Los cambios se guardaron correctamente." });
        } else {
            const coleccionRef = collection(firestore, 'autos');
            addDoc(coleccionRef, finalCarData).catch(error => {
              const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: coleccionRef.path,
                requestResourceData: finalCarData,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Auto añadido", description: "El nuevo auto se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
    } finally {
        alCambiarAperturaFormulario(false);
    }
  };

  const alCambiarAperturaFormulario = (open: boolean) => {
    setEstaFormularioAbierto(open);
    if (!open) {
      setAutoSeleccionado(null);
    }
  };

  const alCambiarAperturaAlerta = (open: boolean) => {
    setEstaAlertaAbierta(open);
    if (!open) {
      setAutoAEliminar(null);
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
                    <TableHead>Precio</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {autosIniciales.map(auto => (
                    <TableRow key={auto.id}>
                    <TableCell>
                      {auto.imagenUrl ? (
                        <Image src={auto.imagenUrl} alt={`${auto.marca} ${auto.modelo}`} width={64} height={48} className="rounded-md object-cover" />
                      ) : (
                        <div className="w-16 h-12 flex items-center justify-center bg-muted rounded-md">
                          <IconoAuto className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{auto.marca}</TableCell>
                    <TableCell>{auto.modelo}</TableCell>
                    <TableCell className="hidden md:table-cell">{auto.anio}</TableCell>
                    <TableCell>${auto.precio.toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => manejarEditar(auto)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => auto.id && confirmarEliminar(auto.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <FormularioAuto 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={alCambiarAperturaFormulario}
            auto={autoSeleccionado}
            alGuardar={manejarGuardar}
            marcas={marcas}
            colores={colores}
            transmisiones={transmisiones}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={alCambiarAperturaAlerta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el auto de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); manejarEliminar(); }} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
