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
import type { Transmission } from '@/lib/types';
import TransmissionForm from './TransmissionForm';
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

interface TransmissionTableProps {
  transmissions: Transmission[];
}

export default function TransmissionTable({ transmissions: initialTransmissions }: TransmissionTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [transmissionToDelete, setTransmissionToDelete] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedTransmission(null);
    setIsFormOpen(true);
  };

  const handleEdit = (transmission: Transmission) => {
    setSelectedTransmission(transmission);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (transmissionId: string) => {
    setTransmissionToDelete(transmissionId);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!transmissionToDelete) return;
    const transmissionRef = doc(firestore, 'transmissions', transmissionToDelete);
    deleteDoc(transmissionRef)
      .then(() => {
        toast({ title: "Transmisión eliminada", description: "El tipo de transmisión se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: transmissionRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setTransmissionToDelete(null);
        setIsAlertOpen(false);
      });
  };

  const handleSave = async (data: Omit<Transmission, 'id'>) => {
    try {
        if (selectedTransmission) {
            const transmissionRef = doc(firestore, 'transmissions', selectedTransmission.id);
            updateDoc(transmissionRef, data).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: transmissionRef.path,
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
            <Button onClick={handleAdd}>Añadir Transmisión</Button>
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
                {initialTransmissions.map(transmission => (
                    <TableRow key={transmission.id}>
                    <TableCell className="font-medium">{transmission.name}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(transmission)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => transmission.id && confirmDelete(transmission.id)} className="text-destructive">
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
        <TransmissionForm 
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            transmission={selectedTransmission}
            onSave={handleSave}
        />
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de transmisión de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setTransmissionToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
