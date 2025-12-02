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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { uploadImage } from '@/core/services/storageService';

interface TablaMarcasProps {
  marcas: Marca[];
}

export default function TablaMarcas({ marcas: marcasIniciales }: TablaMarcasProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [marcaAEliminar, setMarcaAEliminar] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const manejarAnadir = () => {
    setMarcaSeleccionada(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (marca: Marca) => {
    setMarcaSeleccionada(marca);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (marcaId: string) => {
    setMarcaAEliminar(marcaId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!marcaAEliminar) return;
    const marcaRef = doc(firestore, 'marcas', marcaAEliminar);
    try {
        await deleteDoc(marcaRef);
        toast({ title: "Marca eliminada", description: "La marca se ha eliminado correctamente." });
    } catch (error) {
        const contextualError = new FirestorePermissionError({
            operation: 'delete',
            path: marcaRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
    } finally {
        alCambiarAperturaAlerta(false);
    }
  };

  const manejarGuardar = async (data: Omit<Marca, 'id'>, file?: File) => {
    try {
        let finalBrandData: any = { ...data };

        if (file) {
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
            toast({ title: "Marca actualizada", description: "Los cambios se guardaron correctamente." });

        } else {
            const nuevaMarcaRef = doc(collection(firestore, 'marcas'));
            const idEntidad = nuevaMarcaRef.id;
            const datosMarca = { ...finalBrandData, id: idEntidad };
            await setDoc(nuevaMarcaRef, datosMarca);
            toast({ title: "Marca añadida", description: "La nueva marca se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
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
        alCambiarAperturaFormulario(false);
    }
  };

  const alCambiarAperturaFormulario = (open: boolean) => {
    setEstaFormularioAbierto(open);
    if (!open) {
      setMarcaSeleccionada(null);
    }
  };

  const alCambiarAperturaAlerta = (open: boolean) => {
    setEstaAlertaAbierta(open);
    if (!open) {
      setMarcaAEliminar(null);
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
                            {marca.logoUrl && <AvatarImage src={marca.logoUrl} alt={marca.name} className="object-contain" />}
                            <AvatarFallback>
                                <Tag className='h-5 w-5' />
                            </AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{marca.name}</TableCell>
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
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={alCambiarAperturaAlerta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la marca de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); manejarEliminar(); }} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
