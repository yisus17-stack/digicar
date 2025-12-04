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
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import type { Transmision } from '@/core/types';
import FormularioTransmision from './TransmissionForm';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Swal from 'sweetalert2';

interface TablaTransmisionesProps {
  transmisiones: Transmision[];
}

export default function TablaTransmisiones({ transmisiones: transmisionesIniciales }: TablaTransmisionesProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [transmisionSeleccionada, setTransmisionSeleccionada] = useState<Transmision | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();

  const manejarAnadir = () => {
    setTransmisionSeleccionada(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (transmision: Transmision) => {
    setTransmisionSeleccionada(transmision);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (transmisionId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de transmisión de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        manejarEliminar(transmisionId);
      }
    });
  };

  const manejarEliminar = async (transmisionId: string) => {
    if (!transmisionId) return;
    const transmisionRef = doc(firestore, 'transmisiones', transmisionId);
    try {
        await deleteDoc(transmisionRef);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La transmisión ha sido eliminada con éxito.',
          icon: 'success'
        });
    } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la transmisión. Verifica los permisos.',
          icon: 'error'
        });
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: transmisionRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const manejarGuardar = async (data: Omit<Transmision, 'id'>) => {
    setIsSaving(true);
    try {
        if (transmisionSeleccionada) {
            const transmisionRef = doc(firestore, 'transmisiones', transmisionSeleccionada.id);
            await updateDoc(transmisionRef, data);
            Swal.fire({ title: '¡Actualizada!', text: 'La transmisión se ha actualizado correctamente.', icon: 'success' });
        } else {
            const collectionRef = collection(firestore, 'transmisiones');
            await addDoc(collectionRef, data);
            Swal.fire({ title: '¡Creada!', text: 'La nueva transmisión se ha añadido con éxito.', icon: 'success' });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar la transmisión.', icon: 'error' });
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

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Transmisiones</h1>
            <Button onClick={manejarAnadir}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Transmisión
            </Button>
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
    </>
  );
}
