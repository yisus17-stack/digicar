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
import type { Transmision } from '@/core/types';
import FormularioTransmision from './TransmissionForm';
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

interface TablaTransmisionesProps {
  transmisiones: Transmision[];
}

export default function TablaTransmisiones({ transmisiones: transmisionesIniciales }: TablaTransmisionesProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [transmisionSeleccionada, setTransmisionSeleccionada] = useState<Transmision | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [transmisionAEliminar, setTransmisionAEliminar] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const manejarAnadir = () => {
    setTransmisionSeleccionada(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (transmision: Transmision) => {
    setTransmisionSeleccionada(transmision);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (transmisionId: string) => {
    setTransmisionAEliminar(transmisionId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!transmisionAEliminar) return;
    const transmisionRef = doc(firestore, 'transmissions', transmisionAEliminar);
    deleteDoc(transmisionRef)
      .then(() => {
        toast({ title: "Transmisión eliminada", description: "El tipo de transmisión se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: transmisionRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setTransmisionAEliminar(null);
        setEstaAlertaAbierta(false);
      });
  };

  const manejarGuardar = async (data: Omit<Transmision, 'id'>) => {
    try {
        if (transmisionSeleccionada) {
            const transmisionRef = doc(firestore, 'transmissions', transmisionSeleccionada.id);
            updateDoc(transmisionRef, data).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: transmisionRef.path,
                requestResourceData: data,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Transmisión actualizada", description: "Los cambios se guardaron correctamente." });
        } else {
            const collectionRef = collection(firestore, 'transmissions');
            addDoc(collectionRef, data).catch(error => {
              const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: collectionRef.path,
                requestResourceData: data,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Transmisión añadida", description: "El nuevo tipo de transmisión se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Administrar Transmisiones</h1>
            <Button onClick={manejarAnadir}>Añadir Transmisión</Button>
        </div>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {transmisionesIniciales.map(transmision => (
                    <TableRow key={transmision.id}>
                    <TableCell className="font-medium">{transmision.name}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => manejarEditar(transmision)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => transmision.id && confirmarEliminar(transmision.id)} className="text-destructive">
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
        <FormularioTransmision 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={setEstaFormularioAbierto}
            transmision={transmisionSeleccionada}
            alGuardar={manejarGuardar}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={setEstaAlertaAbierta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de transmisión de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setTransmisionAEliminar(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={manejarEliminar} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
