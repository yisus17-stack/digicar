'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, PlusCircle, ArrowUpDown } from 'lucide-react';
import type { Color } from '@/core/types';
import FormularioColor from './ColorForm';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Swal from 'sweetalert2';
import { DataTable } from './DataTable';
import { Checkbox } from '@/components/ui/checkbox';


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

  const manejarEliminar = async (color: Color) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#595c97',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡elimínalo!',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    const autosRef = collection(firestore, 'autos');
    const querySnapshot = await getDocs(autosRef);
    let isUsed = false;

    for (const docSnapshot of querySnapshot.docs) {
        const carData = docSnapshot.data();
        if (carData.variantes && Array.isArray(carData.variantes)) {
            if (carData.variantes.some(v => v.color === color.nombre)) {
                isUsed = true;
                break; 
            }
        }
    }
    
    if (isUsed) {
        Swal.fire({
            title: 'No se puede eliminar',
            text: `El color "${color.nombre}" está siendo utilizado por al menos un auto y no puede ser eliminado.`,
            icon: 'error',
            confirmButtonColor: '#595c97',
        });
        return;
    }
    
    if (!color.id) return;
    const colorRef = doc(firestore, 'colores', color.id);
    try {
        await deleteDoc(colorRef);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El color ha sido eliminado con éxito.',
          icon: 'success',
          confirmButtonColor: '#595c97',
        });
    } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el color. Verifica los permisos.',
          icon: 'error',
          confirmButtonColor: '#595c97',
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
            Swal.fire({ title: '¡Actualizado!', text: 'El color se ha actualizado correctamente.', icon: 'success', confirmButtonColor: '#595c97', });
        } else {
            const collectionRef = collection(firestore, 'colores');
            const finalData = { ...data, createdAt: serverTimestamp() };
            await addDoc(collectionRef, finalData);
            Swal.fire({ title: '¡Creado!', text: 'El nuevo color se ha añadido con éxito.', icon: 'success', confirmButtonColor: '#595c97', });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar el color.', icon: 'error', confirmButtonColor: '#595c97', });
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

  const columns: ColumnDef<Color>[] = [
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
        const color = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => manejarEditar(color)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => manejarEliminar(color)}>
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Administrar Colores</h1>
        <Button onClick={manejarAnadir}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Color
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={coloresIniciales}
        filterColumnId="nombre"
        filterPlaceholder="Buscar por nombre..."
      />
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
