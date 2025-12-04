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
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import type { Transmision } from '@/core/types';
import FormularioTransmision from './TransmissionForm';
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

interface TablaTransmisionesProps {
  transmisiones: Transmision[];
}

export default function TablaTransmisiones({ transmisiones: transmisionesIniciales }: TablaTransmisionesProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [transmisionSeleccionada, setTransmisionSeleccionada] = useState<Transmision | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [transmisionAEliminar, setTransmisionAEliminar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { showNotification, updateNotificationStatus } = useNotification();

  const manejarAnadir = () => {
    setTransmisionSeleccionada(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (transmision: Transmision) => {
    setTransmisionSeleccionada(transmision);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (transmisionId: string) => {
    setTransmisionAEliminar(transmisionId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!transmisionAEliminar) return;
    const transmisionRef = doc(firestore, 'transmisiones', transmisionAEliminar);
    const notificationId = showNotification({ title: 'Eliminando transmisión...', status: 'loading' });
    try {
        await deleteDoc(transmisionRef);
        updateNotificationStatus(notificationId, 'success', 'Transmisión eliminada con éxito');
    } catch (error) {
        updateNotificationStatus(notificationId, 'error', 'Error al eliminar la transmisión');
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: transmisionRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    } finally {
        alCambiarAperturaAlerta(false);
    }
  };

  const manejarGuardar = async (data: Omit<Transmision, 'id'>) => {
    setIsSaving(true);
    const notificationId = showNotification({ title: 'Guardando transmisión...', status: 'loading' });
    try {
        if (transmisionSeleccionada) {
            const transmisionRef = doc(firestore, 'transmisiones', transmisionSeleccionada.id);
            await updateDoc(transmisionRef, data);
            updateNotificationStatus(notificationId, 'success', 'Transmisión actualizada con éxito');
        } else {
            const collectionRef = collection(firestore, 'transmisiones');
            await addDoc(collectionRef, data);
            updateNotificationStatus(notificationId, 'success', 'Transmisión añadida con éxito');
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        updateNotificationStatus(notificationId, 'error', 'Error al guardar la transmisión');
         if (error.code && error.code.includes('permission-denied')) {
            const contextualError = new FirestorePermissionError({
                operation: transmisionSeleccionada ? 'update' : 'create',
                path: transmisionSeleccionada ? `transmisiones/${transmisionSeleccionada.id}` : 'transmisiones',
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
      setTransmisionSeleccionada(null);
    }
  };

  const alCambiarAperturaAlerta = (open: boolean) => {
    setEstaAlertaAbierta(open);
    if (!open) {
      setTransmisionAEliminar(null);
    }
  };

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Transmisiones</h1>
            <Button onClick={manejarAnadir}>Añadir Transmisión</Button>
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
                {transmisionesIniciales.map(transmision => (
                    <TableRow key={transmision.id}>
                    <TableCell className="font-medium">{transmision.nombre}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => manejarEditar(transmision)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => transmision.id && confirmarEliminar(transmision.id)}>
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
        <FormularioTransmision 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={alCambiarAperturaFormulario}
            transmision={transmisionSeleccionada}
            alGuardar={manejarGuardar}
            isSaving={isSaving}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={alCambiarAperturaAlerta}>
            <AlertDialogContent>
                <AlertDialogHeader className="items-center text-center">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800/20 sm:mx-0 sm:h-10 sm:w-10">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </div>
                    <AlertDialogTitle className="pt-2">¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de transmisión de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); manejarEliminar(); }} className="bg-destructive hover:bg-destructive/90">
                        Sí, eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
