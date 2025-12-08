
'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Tag, PlusCircle, ArrowUpDown } from 'lucide-react';
import type { Marca } from '@/core/types';
import FormularioMarca from './BrandForm';
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc, serverTimestamp, getDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadImage, deleteImage } from '@/core/services/storageService';
import Swal from 'sweetalert2';
import { DataTable } from './DataTable';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TablaMarcasProps {
  marcas: Marca[];
}

export default function TablaMarcas({ marcas: marcasIniciales }: TablaMarcasProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();

  const manejarAnadir = () => {
    setMarcaSeleccionada(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (marca: Marca) => {
    setMarcaSeleccionada(marca);
    setEstaFormularioAbierto(true);
  };

  const manejarEliminar = async (marca: Marca) => {
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
    const q = query(autosRef, where('marca', '==', marca.nombre), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        Swal.fire({
            title: 'No se puede eliminar',
            text: `La marca "${marca.nombre}" está siendo utilizada por al menos un auto y no puede ser eliminada.`,
            icon: 'error',
            confirmButtonColor: '#595c97',
        });
        return;
    }

    try {
        const marcaRef = doc(firestore, 'marcas', marca.id);
        
        if (marca.logoUrl) {
            await deleteImage(marca.logoUrl);
        }
        await deleteDoc(marcaRef);

        Swal.fire({
            title: '¡Eliminada!',
            text: 'La marca y su logo han sido eliminados con éxito.',
            icon: 'success',
            confirmButtonColor: '#595c97',
        });
    } catch (error) {
        console.error("Error deleting brand:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo eliminar la marca. Verifica los permisos.',
            icon: 'error',
            confirmButtonColor: '#595c97',
        });
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: `marcas/${marca.id}`,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
};

  const manejarGuardar = async (data: Omit<Marca, 'id'>, file?: File) => {
    setIsSaving(true);
    
    Swal.fire({
      title: 'Guardando marca...',
      text: 'Por favor, espera.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
        let finalBrandData: any = { ...data };

        if (file) {
            try {
                const logoUrl = await uploadImage(file);
                finalBrandData.logoUrl = logoUrl;
            } catch (uploadError) {
                console.error('Upload Error:', uploadError);
                throw uploadError; 
            }
        } else if (marcaSeleccionada && data.logoUrl) {
            finalBrandData.logoUrl = data.logoUrl;
        } else if (marcaSeleccionada) {
            if (marcaSeleccionada.logoUrl && !data.logoUrl) {
                await deleteImage(marcaSeleccionada.logoUrl);
            }
            finalBrandData.logoUrl = data.logoUrl || '';
        }

        if (marcaSeleccionada) {
            const marcaRef = doc(firestore, 'marcas', marcaSeleccionada.id);
            await updateDoc(marcaRef, finalBrandData);
            Swal.fire({ title: '¡Actualizada!', text: 'La marca se ha actualizado correctamente.', icon: 'success', confirmButtonColor: '#595c97' });
        } else {
            const nuevaMarcaRef = doc(collection(firestore, 'marcas'));
            const idEntidad = nuevaMarcaRef.id;
            const datosMarca = { ...finalBrandData, id: idEntidad, createdAt: serverTimestamp() };
            await setDoc(nuevaMarcaRef, datosMarca);
            Swal.fire({ title: '¡Creada!', text: 'La nueva marca se ha añadido con éxito.', icon: 'success', confirmButtonColor: '#595c97' });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar la marca.', icon: 'error', confirmButtonColor: '#595c97' });
        
        if (error.code && error.code.includes('permission-denied')) {
            const contextualError = new FirestorePermissionError({
              operation: marcaSeleccionada ? 'update' : 'create',
              path: marcaSeleccionada ? `marcas/${marcaSeleccionada.id}` : 'marcas',
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
      setMarcaSeleccionada(null);
    }
  };

  const columns: ColumnDef<Marca>[] = [
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
      accessorKey: 'logoUrl',
      header: 'Logo',
      cell: ({ row }) => {
        const marca = row.original;
        return (
          <Avatar>
            {marca.logoUrl && <AvatarImage src={marca.logoUrl} alt={marca.nombre} className="object-contain" />}
            <AvatarFallback>
              <Tag className='h-5 w-5' />
            </AvatarFallback>
          </Avatar>
        );
      },
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
        const marca = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => manejarEditar(marca)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={() => manejarEliminar(marca)}>
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
        <CardHeader className="flex-col gap-4 sm:flex-row justify-between items-center p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold">Administrar Marcas</CardTitle>
          <Button onClick={manejarAnadir}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Marca
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <DataTable
              columns={columns}
              data={marcasIniciales}
              filterColumnId="nombre"
              filterPlaceholder="Buscar por nombre..."
          />
        </CardContent>
      </Card>

      <FormularioMarca 
          estaAbierto={estaFormularioAbierto}
          alCambiarApertura={alCambiarAperturaFormulario}
          marca={marcaSeleccionada}
          alGuardar={manejarGuardar}
          isSaving={isSaving}
      />
    </>
  );
}
