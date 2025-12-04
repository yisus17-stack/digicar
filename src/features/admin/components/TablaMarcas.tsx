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
import { Edit, Trash2, Tag, PlusCircle, Save } from 'lucide-react';
import type { Marca } from '@/core/types';
import FormularioMarca from './BrandForm';
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadImage } from '@/core/services/storageService';
import Swal from 'sweetalert2';

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
  
  const confirmarEliminar = (marcaId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer. Esto eliminará permanentemente la marca de la base de datos.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#595c97',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        manejarEliminar(marcaId);
      }
    });
  };

  const manejarEliminar = async (marcaId: string) => {
    if (!marcaId) return;
    const marcaRef = doc(firestore, 'marcas', marcaId);
    try {
        await deleteDoc(marcaRef);
        Swal.fire({
          title: '¡Eliminada!',
          text: 'La marca ha sido eliminada con éxito.',
          icon: 'success',
          confirmButtonColor: '#595c97',
        });
    } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la marca. Verifica los permisos.',
          icon: 'error',
          confirmButtonColor: '#595c97',
        });
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: marcaRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const manejarGuardar = async (data: Omit<Marca, 'id'>, file?: File) => {
    setIsSaving(true);
    
    try {
        let finalBrandData: any = { ...data };

        if (file) {
            Swal.fire({
              title: 'Subiendo imagen...',
              text: 'Por favor, espera.',
              icon: 'info',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              },
              confirmButtonColor: '#595c97',
            });
            const logoUrl = await uploadImage(file);
            finalBrandData.logoUrl = logoUrl;
        } else if (marcaSeleccionada && data.logoUrl) {
            finalBrandData.logoUrl = data.logoUrl;
        } else if (marcaSeleccionada) {
            finalBrandData.logoUrl = marcaSeleccionada.logoUrl || '';
        }

        if (marcaSeleccionada) {
            const marcaRef = doc(firestore, 'marcas', marcaSeleccionada.id);
            await updateDoc(marcaRef, finalBrandData);
            Swal.fire({ title: '¡Actualizada!', text: 'La marca se ha actualizado correctamente.', icon: 'success', confirmButtonColor: '#595c97', });
        } else {
            const nuevaMarcaRef = doc(collection(firestore, 'marcas'));
            const idEntidad = nuevaMarcaRef.id;
            const datosMarca = { ...finalBrandData, id: idEntidad };
            await setDoc(nuevaMarcaRef, datosMarca);
            Swal.fire({ title: '¡Creada!', text: 'La nueva marca se ha añadido con éxito.', icon: 'success', confirmButtonColor: '#595c97', });
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        Swal.fire({ title: 'Error', text: 'Ocurrió un error al guardar la marca.', icon: 'error', confirmButtonColor: '#595c97', });
        
        console.error("Error al guardar la marca:", error);
        
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

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0">
            <h1 className="text-3xl font-bold">Administrar Marcas</h1>
            <Button onClick={manejarAnadir}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Marca
            </Button>
        </div>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Acciones</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {marcasIniciales.map(marca => (
                    <TableRow key={marca.id}>
                    <TableCell>
                        <Avatar>
                            {marca.logoUrl && <AvatarImage src={marca.logoUrl} alt={marca.nombre} className="object-contain" />}
                            <AvatarFallback>
                                <Tag className='h-5 w-5' />
                            </AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{marca.nombre}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => manejarEditar(marca)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => marca.id && confirmarEliminar(marca.id)}>
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
