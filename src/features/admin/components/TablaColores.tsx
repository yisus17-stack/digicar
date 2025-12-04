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
import type { Color } from '@/core/types';
import FormularioColor from './ColorForm';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Swal from 'sweetalert2';


interface TablaColoresProps {
  colors: Color[];
}

export default function TablaColores({ colors: coloresIniciales }: TablaColoresProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState<Color | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();

  const manejarAnadir = () => {
    setColorSeleccionado(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (color: Color) => {
    setColorSeleccionado(color);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (colorId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer. Esto eliminará permanentemente el color de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        manejarEliminar(colorId);
      }
    });
  };

  const manejarEliminar = async (colorId: string) => {
    if (!colorId) return;
    const colorRef = doc(firestore, 'colores', colorId);
    try {
        await deleteDoc(colorRef);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El color ha sido eliminado con éxito.',
          icon: 'success'
        });
    } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el color. Verifica los permisos.',
          icon: 'error'
        });
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: colorRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const manejarGuardar = async (data: Omit<Color, 'id'>) => {
    setIsSaving(true);
    try {
        if (colorSeleccionado) {
            const colorRef = doc(firestore, 'colores', colorSeleccionado.id);
            await updateDoc(colorRef, data);
            Swal.fire({ title: '¡Actualizado!', text: 'El color se ha actualizado correctamente.', icon: 'success' });
        } else {
            const collectionRef = collection(firestore, 'colores');
            await addDoc(collectionRef, data);
            Swal.fire({ title: '¡Creado!', text: 'El nuevo color se ha añadido con éxito.', icon: 'success' });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar el color.', icon: 'error' });
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

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Colores</h1>
            <Button onClick={manejarAnadir}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Color
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
    </>
  );
}
