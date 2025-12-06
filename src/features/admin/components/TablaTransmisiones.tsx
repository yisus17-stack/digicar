'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle, ArrowUpDown } from 'lucide-react';
import type { Transmision } from '@/core/types';
import FormularioTransmision from './TransmissionForm';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Swal from 'sweetalert2';
import { DataTable } from './DataTable';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

  const manejarEliminar = async (transmision: Transmision) => {
    const autosRef = collection(firestore, 'autos');
    const q = query(autosRef, where('transmision', '==', transmision.nombre), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        Swal.fire({
            title: 'No se puede eliminar',
            text: `El tipo de transmisión "${transmision.nombre}" está siendo utilizada por al menos un auto y no puede ser eliminada.`,
            icon: 'error',
            confirmButtonColor: '#595c97',
        });
        return;
    }
    
    if (!transmision.id) return;
    const transmisionRef = doc(firestore, 'transmisiones', transmision.id);
    try {
        await deleteDoc(transmisionRef);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La transmisión ha sido eliminada con éxito.',
          icon: 'success',
          confirmButtonColor: '#595c97',
        });
    } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la transmisión. Verifica los permisos.',
          icon: 'error',
          confirmButtonColor: '#595c97',
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
            Swal.fire({ title: '¡Actualizada!', text: 'La transmisión se ha actualizado correctamente.', icon: 'success', confirmButtonColor: '#595c97', });
        } else {
            const collectionRef = collection(firestore, 'transmisiones');
            const finalData = { ...data, createdAt: serverTimestamp() };
            await addDoc(collectionRef, finalData);
            Swal.fire({ title: '¡Creada!', text: 'La nueva transmisión se ha añadido con éxito.', icon: 'success', confirmButtonColor: '#595c97', });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar la transmisión.', icon: 'error', confirmButtonColor: '#595c97', });
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

  const columns: ColumnDef<Transmision>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'nombre',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const transmision = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => manejarEditar(transmision)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de transmisión de la base de datos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => manejarEliminar(transmision)} className="bg-destructive hover:bg-destructive/90">
                    Sí, eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-3xl font-bold">Administrar Transmisiones</h1>
        <Button onClick={manejarAnadir}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Transmisión
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={transmisionesIniciales}
        filterColumnId="nombre"
        filterPlaceholder="Buscar por nombre..."
      />
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
