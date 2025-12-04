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
  const { showNotification } = useNotification();

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
    showNotification({ title: 'Eliminando transmisión...', status: 'loading' });
    try {
        await deleteDoc(transmisionRef);
        showNotification({ title: "Transmisión eliminada con éxito", status: 'success' });
    } catch (error) {
        showNotification({ title: "Error al eliminar la transmisión", status: 'error' });
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
    showNotification({ title: 'Guardando transmisión...', status: 'loading' });
    try {
        if (transmisionSeleccionada) {
            const transmisionRef = doc(firestore, 'transmisiones', transmisionSeleccionada.id);
            await updateDoc(transmisionRef, data);
            showNotification({ title: "Transmisión actualizada", status: 'success' });
        } else {
            const collectionRef = collection(firestore, 'transmisiones');
            await addDoc(collectionRef, data);
            showNotification({ title: "Transmisión añadida", status: 'success' });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        showNotification({ title: "Error al guardar la transmisión", status: 'error' });
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
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de transmisión de la base de datos.
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
