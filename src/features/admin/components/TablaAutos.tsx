'use client';

import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Car as IconoAuto, PlusCircle, ArrowUpDown } from 'lucide-react';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import FormularioAuto from './CarForm';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';
import { uploadImage, deleteImage } from '@/core/services/storageService';
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

interface TablaAutosProps {
  autos: Car[];
  marcas: Marca[];
  colores: Color[];
  transmisiones: Transmision[];
}

export default function TablaAutos({ autos: autosIniciales, marcas, colores, transmisiones }: TablaAutosProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [autoSeleccionado, setAutoSeleccionado] = useState<Car | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();

  const manejarAnadir = () => {
    setAutoSeleccionado(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (auto: Car) => {
    setAutoSeleccionado(auto);
    setEstaFormularioAbierto(true);
  };
  
  const manejarEliminar = async (autoId: string) => {
    try {
        const autoRef = doc(firestore, 'autos', autoId);
        const autoDoc = await getDoc(autoRef);

        if (autoDoc.exists()) {
            const autoData = autoDoc.data() as Car;
            if (autoData.variantes && autoData.variantes.length > 0) {
                // Delete all variant images from storage
                const deletePromises = autoData.variantes
                    .map(variant => variant.imagenUrl)
                    .filter(Boolean) // Filter out any empty URLs
                    .map(url => deleteImage(url));
                await Promise.all(deletePromises);
            }
        }
        
        // Delete the Firestore document
        await deleteDoc(autoRef);

        Swal.fire({
          title: '¡Eliminado!',
          text: 'El auto y sus imágenes han sido eliminados con éxito.',
          icon: 'success',
          confirmButtonColor: '#595c97',
        });

    } catch (error) {
        console.error("Error deleting car and its assets:", error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el auto. Verifica los permisos.',
          icon: 'error',
          confirmButtonColor: '#595c97',
        });
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: `autos/${autoId}`,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const manejarGuardar = async (datosAuto: Omit<Car, 'id'>, files: (File | undefined)[]) => {
    setIsSaving(true);
    
    try {
        const finalCarData: any = { ...datosAuto };
        
        const uploadPromises = finalCarData.variantes.map(async (variante: any, index: number) => {
            const file = files[index];
            if (file) {
                 Swal.fire({
                    title: 'Subiendo imágenes...',
                    text: `Por favor, espera. Subiendo variante ${index + 1}`,
                    icon: 'info',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); },
                    confirmButtonColor: '#595c97',
                });
                const imageUrl = await uploadImage(file);
                return { ...variante, imagenUrl: imageUrl };
            }
            return variante;
        });

        finalCarData.variantes = await Promise.all(uploadPromises);

        if (autoSeleccionado) {
            const autoRef = doc(firestore, 'autos', autoSeleccionado.id);
            await updateDoc(autoRef, {
                ...finalCarData,
                variantes: finalCarData.variantes,
            });
            Swal.fire({ title: '¡Actualizado!', text: 'El auto se ha actualizado correctamente.', icon: 'success', confirmButtonColor: '#595c97', });
        } else {
            const coleccionRef = collection(firestore, 'autos');
            const newDocRef = doc(coleccionRef); // Creates a ref with a new auto-generated ID
            const finalDataWithId = { ...finalCarData, id: newDocRef.id, createdAt: serverTimestamp() };
            await setDoc(newDocRef, finalDataWithId); // Use setDoc to create the document
            Swal.fire({ title: '¡Creado!', text: 'El nuevo auto se ha añadido con éxito.', icon: 'success', confirmButtonColor: '#595c97', });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar los cambios.', icon: 'error', confirmButtonColor: '#595c97', });
        
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

  const columns: ColumnDef<Car>[] = [
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
      accessorKey: 'imagenUrl',
      header: 'Imagen',
      cell: ({ row }) => {
        const auto = row.original;
        const displayVariant = auto.variantes && auto.variantes.length > 0 ? auto.variantes[0] : null;
        const imageUrl = displayVariant?.imagenUrl ?? auto.imagenUrl;
        return imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${auto.marca} ${auto.modelo}`}
            width={80}
            height={60}
            className="rounded-md object-cover"
          />
        ) : (
          <div className="w-20 h-12 flex items-center justify-center bg-muted rounded-md">
            <IconoAuto className="h-6 w-6 text-muted-foreground" />
          </div>
        );
      },
    },
    {
      accessorKey: 'marca',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Marca
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'modelo',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Modelo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'anio',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Año
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorFn: (row) => row.variantes?.[0]?.precio ?? row.precio ?? 0,
      id: 'precio',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Precio Base
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const auto = row.original;
        const price = auto.variantes?.[0]?.precio ?? auto.precio ?? 0;
        return `$${price.toLocaleString('es-MX')}`;
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const auto = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => manejarEditar(auto)}>
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
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el auto y todas sus imágenes de la base de datos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => manejarEliminar(auto.id)} className="bg-destructive hover:bg-destructive/90">
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
            <h1 className="text-3xl font-bold">Administrar Autos</h1>
            <Button onClick={manejarAnadir}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Auto
            </Button>
        </div>
        
        <DataTable
            columns={columns}
            data={autosIniciales}
            filterColumnId="modelo"
            filterPlaceholder="Buscar por modelo..."
        />

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
    </>
  );
}
