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
import { MoreHorizontal, Edit, Trash2, Droplets } from 'lucide-react';
import type { FuelType } from '@/lib/types';
import FuelTypeForm from './FuelTypeForm';
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
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface FuelTypeTableProps {
  fuels: FuelType[];
}

export default function FuelTypeTable({ fuels: initialFuels }: FuelTypeTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [fuelToDelete, setFuelToDelete] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedFuel(null);
    setIsFormOpen(true);
  };

  const handleEdit = (fuel: FuelType) => {
    setSelectedFuel(fuel);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (fuelId: string) => {
    setFuelToDelete(fuelId);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!fuelToDelete) return;
    const fuelRef = doc(firestore, 'fuelTypes', fuelToDelete);
    deleteDoc(fuelRef)
      .then(() => {
        toast({ title: "Combustible eliminado", description: "El tipo de combustible se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: fuelRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setFuelToDelete(null);
        setIsAlertOpen(false);
      });
  };

  const handleSave = async (data: Omit<FuelType, 'id'>) => {
    try {
        if (selectedFuel) {
            const fuelRef = doc(firestore, 'fuelTypes', selectedFuel.id);
            updateDoc(fuelRef, data).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: fuelRef.path,
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
            <Button onClick={handleAdd}>Añadir Combustible</Button>
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
                {initialFuels.map(fuel => (
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
                            <DropdownMenuItem onClick={() => handleEdit(fuel)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => fuel.id && confirmDelete(fuel.id)} className="text-destructive">
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
        <FuelTypeForm 
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            fuel={selectedFuel}
            onSave={handleSave}
        />
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el tipo de combustible de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setFuelToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
