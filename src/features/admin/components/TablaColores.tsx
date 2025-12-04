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
import { Edit, Trash2 } from 'lucide-react';
import type { Color } from '@/core/types';
import FormularioColor from './ColorForm';
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
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useNotification } from '@/core/contexts/NotificationContext';


interface TablaColoresProps {
  colors: Color[];
}

export default function TablaColores({ colors: coloresIniciales }: TablaColoresProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState<Color | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [colorAEliminar, setColorAEliminar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { showNotification, updateNotificationStatus } = useNotification();


  const manejarAnadir = () => {
    setColorSeleccionado(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (color: Color) => {
    setColorSeleccionado(color);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (colorId: string) => {
    setColorAEliminar(colorId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!colorAEliminar) return;
    const colorRef = doc(firestore, 'colores', colorAEliminar);
    const notificationId = showNotification({ title: 'Eliminando color...', status: 'loading' });
    try {
        await deleteDoc(colorRef);
        updateNotificationStatus(notificationId, 'success', 'Color eliminado con éxito');
    } catch (error) {
        updateNotificationStatus(notificationId, 'error', 'Error al eliminar el color');
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: colorRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    } finally {
        alCambiarAperturaAlerta(false);
    }
  };

  const manejarGuardar = async (data: Omit<Color, 'id'>) => {
    setIsSaving(true);
    const notificationId = showNotification({ title: 'Guardando color...', status: 'loading' });
    try {
        if (colorSeleccionado) {
            const colorRef = doc(firestore, 'colores', colorSeleccionado.id);
            await updateDoc(colorRef, data);
            updateNotificationStatus(notificationId, 'success', 'Color actualizado con éxito');
        } else {
            const collectionRef = collection(firestore, 'colores');
            await addDoc(collectionRef, data);
            updateNotificationStatus(notificationId, 'success', 'Color añadido con éxito');
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        updateNotificationStatus(notificationId, 'error', 'Error al guardar el color');
        if (error.code && error.code.includes('permission-denied')) {
            const contextualError = new FirestorePermissionError({
                operation: colorSeleccionado ? 'update' : 'create',
                path: colorSeleccionado ? `colores/${colorSeleccionado.id}` : 'colores',
                requestResourceData: data,
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
      setColorSeleccionado(null);
    }
  };

  const alCambiarAperturaAlerta = (open: boolean) => {
    setEstaAlertaAbierta(open);
    if (!open) {
      setColorAEliminar(null);
    }
  };

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Colores</h1>
            <Button onClick={manejarAnadir}>Añadir Color</Button>
        </div>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {coloresIniciales.map(color => (
                    <TableRow key={color.id}>
                    <TableCell className="font-medium">{color.nombre}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => manejarEditar(color)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => color.id && confirmarEliminar(color.id)}>
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
        <FormularioColor 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={alCambiarAperturaFormulario}
            color={colorSeleccionado}
            alGuardar={manejarGuardar}
            isSaving={isSaving}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={alCambiarAperturaAlerta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el color de la base de datos.
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
