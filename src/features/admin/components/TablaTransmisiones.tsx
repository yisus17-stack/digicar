
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#595c97',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡elimínala!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

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

  const manejarGuardar = async (data: Omit<Transmision, 'id'>, event: React.FormEvent<HTMLFormElement>) => {
    setIsSaving(true);
    const normalizedName = data.nombre.trim().toLowerCase();

    const isDuplicate = transmisionesIniciales.some(
      (transmision) =>
        transmision.nombre.trim().toLowerCase() === normalizedName &&
        transmision.id !== transmisionSeleccionada?.id
    );

    if (isDuplicate) {
      Swal.fire({
        title: 'Transmisión Duplicada',
        text: `La transmisión "${data.nombre}" ya existe.`,
        icon: 'error',
        confirmButtonColor: '#595c97',
        target: event.currentTarget.closest('[role="dialog"]') || undefined,
      });
      setIsSaving(false);
      return;
    }

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
            <Button variant="destructive" size="sm" onClick={() => manejarEliminar(transmision)}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row justify-between items-center">
            <CardTitle className="text-xl sm:text-2xl font-bold">Administrar Transmisiones</CardTitle>
            <Button onClick={manejarAnadir}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Transmisión
            </Button>
        </CardHeader>
        <CardContent>
            <DataTable
                columns={columns}
                data={transmisionesIniciales}
                filterColumnId="nombre"
                filterPlaceholder="Buscar por nombre..."
            />
        </CardContent>
      </Card>

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
