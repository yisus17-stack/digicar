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
import { Edit, Trash2, Tag } from 'lucide-react';
import type { Marca } from '@/core/types';
import FormularioMarca from './BrandForm';
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadImage } from '@/core/services/storageService';
import { useNotification } from '@/core/contexts/NotificationContext';
import Swal from 'sweetalert2';

interface TablaMarcasProps {
  marcas: Marca[];
}

export default function TablaMarcas({ marcas: marcasIniciales }: TablaMarcasProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const firestore = useFirestore();
  const { startUpload, updateUploadProgress, completeUpload, errorUpload, showNotification, updateNotificationStatus } = useNotification();

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
      confirmButtonColor: '#3085d6',
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
    const notificationId = showNotification({ title: 'Eliminando marca...', status: 'loading' });
    try {
        await deleteDoc(marcaRef);
        updateNotificationStatus(notificationId, 'success', 'Marca eliminada con éxito');
    } catch (error) {
        updateNotificationStatus(notificationId, 'error', 'Error al eliminar la marca');
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: marcaRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    }
  };

  const manejarGuardar = async (data: Omit<Marca, 'id'>, file?: File) => {
    setIsSaving(true);
    let uploadId: string | null = null;
    let notificationId: string | null = null;

    try {
        let finalBrandData: any = { ...data };

        notificationId = showNotification({ 
            title: marcaSeleccionada ? 'Actualizando marca...' : 'Creando nueva marca...', 
            status: 'loading' 
        });

        if (file) {
            uploadId = startUpload(file);
            const logoUrl = await uploadImage(file, (progress) => {
                if(uploadId) updateUploadProgress(uploadId, progress);
            });
            finalBrandData.logoUrl = logoUrl;
            if (uploadId) completeUpload(uploadId);
        } else if (marcaSeleccionada && data.logoUrl) {
            finalBrandData.logoUrl = data.logoUrl;
        } else if (marcaSeleccionada) {
            finalBrandData.logoUrl = marcaSeleccionada.logoUrl || '';
        }

        if (marcaSeleccionada) {
            const marcaRef = doc(firestore, 'marcas', marcaSeleccionada.id);
            await updateDoc(marcaRef, finalBrandData);
            if(notificationId) updateNotificationStatus(notificationId, 'success', 'Marca actualizada con éxito');

        } else {
            const nuevaMarcaRef = doc(collection(firestore, 'marcas'));
            const idEntidad = nuevaMarcaRef.id;
            const datosMarca = { ...finalBrandData, id: idEntidad };
            await setDoc(nuevaMarcaRef, datosMarca);
            if(notificationId) updateNotificationStatus(notificationId, 'success', 'Marca añadida con éxito');
        }
        alCambiarAperturaFormulario(false);
    } catch (error: any) {
        if (uploadId) errorUpload(uploadId);
        if (notificationId) updateNotificationStatus(notificationId, 'error', 'Error al guardar la marca');
        
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
            <Button onClick={manejarAnadir}>Añadir Marca</Button>
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
