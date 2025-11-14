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
import type { Color } from '@/lib/types';
import ColorForm from './ColorForm';
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

interface ColorTableProps {
  colors: Color[];
}

export default function ColorTable({ colors: initialColors }: ColorTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [colorToDelete, setColorToDelete] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedColor(null);
    setIsFormOpen(true);
  };

  const handleEdit = (color: Color) => {
    setSelectedColor(color);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (colorId: string) => {
    setColorToDelete(colorId);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!colorToDelete) return;
    const colorRef = doc(firestore, 'colors', colorToDelete);
    deleteDoc(colorRef)
      .then(() => {
        toast({ title: "Color eliminado", description: "El color se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: colorRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setColorToDelete(null);
        setIsAlertOpen(false);
      });
  };

  const handleSave = async (data: Omit<Color, 'id'>) => {
    try {
        if (selectedColor) {
            const colorRef = doc(firestore, 'colors', selectedColor.id);
            updateDoc(colorRef, data).catch((error) => {
              const contextualError = new FirestorePermissionError({
                operation: 'update',
                path: colorRef.path,
                requestResourceData: data,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Color actualizado", description: "Los cambios se guardaron correctamente." });
        } else {
            const collectionRef = collection(firestore, 'colors');
            addDoc(collectionRef, data).catch(error => {
              const contextualError = new FirestorePermissionError({
                operation: 'create',
                path: collectionRef.path,
                requestResourceData: data,
              });
              errorEmitter.emit('permission-error', contextualError);
            });
            toast({ title: "Color añadido", description: "El nuevo color se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Administrar Colores</h1>
            <Button onClick={handleAdd}>Añadir Color</Button>
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
                {initialColors.map(color => (
                    <TableRow key={color.id}>
                    <TableCell className="font-medium">{color.name}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(color)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => color.id && confirmDelete(color.id)} className="text-destructive">
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
        <ColorForm 
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            color={selectedColor}
            onSave={handleSave}
        />
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el color de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setColorToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
