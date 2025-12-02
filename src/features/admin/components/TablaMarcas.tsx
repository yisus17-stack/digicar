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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Tag } from 'lucide-react';
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
    const marcaRef = doc(firestore, 'brands', marcaAEliminar);
    deleteDoc(marcaRef)
      .then(() => {
        toast({ title: "Marca eliminada", description: "La marca se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: marcaRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setMarcaAEliminar(null);
        setEstaAlertaAbierta(false);
      });
  };

  const manejarGuardar = async (data: Omit<Marca, 'id'>, file?: File) => {
    try {
        let finalBrandData: Omit<Marca, 'id'> & { logoUrl?: string } = { ...data };

        if (file) {
            const logoUrl = await uploadImage(file);
            finalBrandData.logoUrl = logoUrl;
        }


        if (marcaSeleccionada) {
            const marcaRef = doc(firestore, 'brands', marcaSeleccionada.id);
            await updateDoc(marcaRef, finalBrandData);
            toast({ title: "Marca actualizada", description: "Los cambios se guardaron correctamente." });

        } else {
            const nuevaMarcaRef = doc(collection(firestore, 'brands'));
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
              path: marcaSeleccionada ? `brands/${marcaSeleccionada.id}` : 'brands',
              requestResourceData: data,
            });
            errorEmitter.emit('permission-error', contextualError);
        }
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
                    <TableHead className="w-[50px]"></TableHead>
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
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => manejarEditar(marca)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => marca.id && confirmarEliminar(marca.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
        <FormularioMarca 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={setEstaFormularioAbierto}
            marca={marcaSeleccionada}
            alGuardar={manejarGuardar}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={setEstaAlertaAbierta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la marca de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setMarcaAEliminar(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={manejarEliminar} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
