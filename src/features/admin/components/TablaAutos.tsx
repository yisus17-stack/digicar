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
import { Edit, Trash2, Car as IconoAuto, PlusCircle } from 'lucide-react';
import type { Car, Marca, Color, Transmision } from '@/core/types';
import FormularioAuto from './CarForm';
import { useFirestore } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import Image from 'next/image';
import { uploadImage } from '@/core/services/storageService';
import Swal from 'sweetalert2';

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
  
  const confirmarEliminar = (autoId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer. Esto eliminará permanentemente el auto de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        manejarEliminar(autoId);
      }
    })
  };

  const manejarEliminar = async (autoId: string) => {
    if (!autoId) return;
    const autoRef = doc(firestore, 'autos', autoId);
    try {
        await deleteDoc(autoRef);
        Swal.fire({
          title: '¡Eliminado!',
          text: 'El auto ha sido eliminado con éxito.',
          icon: 'success'
        });
    } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el auto. Verifica los permisos.',
          icon: 'error'
        });
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: autoRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const manejarGuardar = async (datosAuto: Omit<Car, 'id'>, file?: File) => {
    setIsSaving(true);
    
    try {
        let finalCarData: any = { ...datosAuto };
        
        if (file) {
            Swal.fire({
              title: 'Subiendo imagen...',
              text: 'Por favor, espera.',
              icon: 'info',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
            });
            const imageUrl = await uploadImage(file);
            finalCarData.imagenUrl = imageUrl;
        }

        if (autoSeleccionado) {
            const autoRef = doc(firestore, 'autos', autoSeleccionado.id);
            await updateDoc(autoRef, finalCarData);
            Swal.fire({ title: '¡Actualizado!', text: 'El auto se ha actualizado correctamente.', icon: 'success' });
        } else {
            const coleccionRef = collection(firestore, 'autos');
            await addDoc(coleccionRef, finalCarData);
            Swal.fire({ title: '¡Creado!', text: 'El nuevo auto se ha añadido con éxito.', icon: 'success' });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar los cambios.', icon: 'error' });
        
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

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Autos</h1>
            <Button onClick={manejarAnadir}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Auto
            </Button>
        </div>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Marca</TableHead>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Año</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {autosIniciales
                        .filter(auto => auto) // evita autos null o undefined
                        .map(auto => (
                        <TableRow key={auto.id ?? Math.random()}>
                            <TableCell>
                                {auto.imagenUrl ? (
                                    <Image
                                        src={auto.imagenUrl}
                                        alt={`${auto.marca ?? ''} ${auto.modelo ?? ''}`}
                                        width={64}
                                        height={48}
                                        className="rounded-md object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-12 flex items-center justify-center bg-muted rounded-md">
                                        <IconoAuto className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="font-medium">{auto.marca ?? '-'}</TableCell>
                            <TableCell>{auto.modelo ?? '-'}</TableCell>
                            <TableCell>{auto.anio ?? '-'}</TableCell>
                            <TableCell>
                                {auto.precio != null ? `$${auto.precio.toLocaleString('es-MX')}` : '-'}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => manejarEditar(auto)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => auto.id && confirmarEliminar(auto.id)}>
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
