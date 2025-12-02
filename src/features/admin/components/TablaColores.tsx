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
import type { Color } from '@/core/types';
import FormularioColor from './ColorForm';
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

interface TablaColoresProps {
  colors: Color[];
}

export default function TablaColores({ colors: coloresIniciales }: TablaColoresProps) {
  const [estaFormularioAbierto, setEstaFormularioAbierto] = useState(false);
  const [colorSeleccionado, setColorSeleccionado] = useState<Color | null>(null);
  const [estaAlertaAbierta, setEstaAlertaAbierta] = useState(false);
  const [colorAEliminar, setColorAEliminar] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const manejarAnadir = () => {
    setColorSeleccionado(null);
    setEstaFormularioAbierto(true);
  };

  const manejarEditar = (color: Color) => {
    setColorSeleccionado(color);
    setEstaFormularioAbierto(true);
  };
  
  const confirmarEliminar = (colorId: string) => {
    setColorAEliminar(colorId);
    setEstaAlertaAbierta(true);
  };

  const manejarEliminar = async () => {
    if (!colorAEliminar) return;
    const colorRef = doc(firestore, 'colors', colorAEliminar);
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
        setColorAEliminar(null);
        setEstaAlertaAbierta(false);
      });
  };

  const manejarGuardar = async (data: Omit<Color, 'id'>) => {
    try {
        if (colorSeleccionado) {
            const colorRef = doc(firestore, 'colors', colorSeleccionado.id);
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
            <Button onClick={manejarAnadir}>Añadir Color</Button>
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
                {coloresIniciales.map(color => (
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
                            <DropdownMenuItem onClick={() => manejarEditar(color)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => color.id && confirmarEliminar(color.id)} className="text-destructive">
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
        <FormularioColor 
            estaAbierto={estaFormularioAbierto}
            alCambiarApertura={setEstaFormularioAbierto}
            color={colorSeleccionado}
            alGuardar={manejarGuardar}
        />
        <AlertDialog open={estaAlertaAbierta} onOpenChange={setEstaAlertaAbierta}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el color de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setColorAEliminar(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={manejarEliminar} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
