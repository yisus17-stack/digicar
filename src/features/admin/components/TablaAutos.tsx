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
import { useUpload } from '@/core/contexts/UploadContext';

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
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const { startUpload, updateUploadProgress, completeUpload, errorUpload } = useUpload();

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
    setIsSaving(true);
    let uploadId: string | null = null;
    
    try {
        let finalCarData: any = { ...datosAuto };

        if (file) {
            uploadId = startUpload(file);
            const imageUrl = await uploadImage(file, (progress) => {
              if (uploadId) updateUploadProgress(uploadId, progress);
            });
            finalCarData.imagenUrl = imageUrl;
            if (uploadId) completeUpload(uploadId);
        }

        if (autoSeleccionado) {
            const autoRef = doc(firestore, 'autos', autoSeleccionado.id);
            await updateDoc(autoRef, finalCarData);
            toast({ title: "Auto actualizado", description: "Los cambios se guardaron correctamente." });
        } else {
            const coleccionRef = collection(firestore, 'autos');
            await addDoc(coleccionRef, finalCarData);
            toast({ title: "Auto añadido", description: "El nuevo auto se ha añadido a la base de datos." });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        if (uploadId) errorUpload(uploadId);
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
        if (error.code && error.code.includes('permission-denied')) {
          const contextualError = new FirestorePermissionError({
            operation: autoSeleccionado ? 'update' : 'create',
            path: autoSeleccionado ? `autos/${autoSeleccionado.id}` : 'autos',
            requestResourceData: datosAuto,
          });
          errorEmitter.emit('permission-error', contextualError);
        }
    } finally {
        setIsSaving(false);
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
                        <TableHead>Año</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {autosIniciales
                        .filter(auto => auto) // evita autos null o undefined
                        .map(auto => (
                        <TableRow key={auto.id ?? Math.random()}>
                            <TableCell>
                                {auto.imagenUrl ? (
                                    <Image
                                        src={auto.imagenUrl}
                                        alt={`${auto.marca ?? ''} ${auto.modelo ?? ''}`}
                                        width={64}
                                        height={48}
                                        className="rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-12 flex items-center justify-center bg-muted rounded-md">
                                        <IconoAuto className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{auto.marca ?? '-'}</TableCell>
                            <TableCell>{auto.modelo ?? '-'}</TableCell>
                            <TableCell>{auto.anio ?? '-'}</TableCell>
                            <TableCell>
                                {auto.precio != null ? `$${auto.precio.toLocaleString('es-MX')}` : '-'}
                            </TableCell>
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
            isSaving={isSaving}
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
                    <AlertDialogAction
                        onClick={(e) => { e.preventDefault(); manejarEliminar(); }}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
