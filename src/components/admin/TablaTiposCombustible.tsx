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
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { TipoCombustible } from '@/lib/types';
import FormularioTipoCombustible from './FuelTypeForm';
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
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface TablaTiposCombustibleProps {
  combustibles: TipoCombustible[];
}

export default function TablaTiposCombustible({ combustibles: combustiblesIniciales }: TablaTiposCombustibleProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [combustibleSeleccionado, setCombustibleSeleccionado] = useState<TipoCombustible | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [combustibleAEliminar, setCombustibleAEliminar] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const manejarAnadir = () => {
    setCombustibleSeleccionado(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (combustible: TipoCombustible) => {
    setCombustibleSeleccionado(combustible);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (combustibleId: string) => {
    setCombustibleAEliminar(combustibleId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!combustibleAEliminar) return;
    const combustibleRef = doc(firestore, 'fuelTypes', combustibleAEliminar);
    deleteDoc(combustibleRef)
      .then(() => {
        toast({ title: "Combustible eliminado", description: "El tipo de combustible se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: combustibleRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setCombustibleAEliminar(null);
        setEstaAlertaAbierta(false);
      });
  };

  const manejarGuardar = async (data: Omit<TipoCombustible, 'id'>) => {
    try {
        if (combustibleSeleccionado) {
            const combustibleRef = doc(firestore, 'fuelTypes', combustibleSeleccionado.id);
            updateDoc(combustibleRef, data).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: combustibleRef.path,
                requestResourceData: data,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Combustible actualizado", description: "Los cambios se guardaron correctamente." });
        } else {
            const collectionRef = collection(firestore, 'fuelTypes');
            addDoc(collectionRef, data).catch(error => {
              const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: collectionRef.path,
                requestResourceData: data,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Combustible añadido", description: "El nuevo tipo de combustible se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Administrar Combustibles</h1>
            <Button onClick={manejarAnadir}>Añadir Combustible</Button>
        </div>
        <div className="border rounded-lg bg-card">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {combustiblesIniciales.map(fuel => (
                    <TableRow key={fuel.id}>
                    <TableCell className="font-medium">{fuel.name}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => manejarEditar(fuel)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fuel.id && confirmarEliminar(fuel.id)} className="text-destructive">
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
        <FormularioTipoCombustible 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={setEstaFormularioAbierto}
            combustible={combustibleSeleccionado}
            alGuardar={manejarGuardar}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={setEstaAlertaAbierta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de combustible de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCombustibleAEliminar(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={manejarEliminar} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
