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
import type { Car } from '@/lib/types';
import CarForm from './CarForm';
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

interface CarTableProps {
  cars: Car[];
}

export default function CarTable({ cars: initialCars }: CarTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedCar(null);
    setIsFormOpen(true);
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (carId: string) => {
    setCarToDelete(carId);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!carToDelete) return;
    try {
      await deleteDoc(doc(firestore, 'cars', carToDelete));
      toast({ title: "Auto eliminado", description: "El auto se ha eliminado correctamente." });
    } catch (error: any) {
      toast({ title: "Error", description: `No se pudo eliminar el auto: ${error.message}`, variant: "destructive" });
    } finally {
      setCarToDelete(null);
      setIsAlertOpen(false);
    }
  };

  const handleSave = async (data: Omit<Car, 'id' | 'image'>) => {
    try {
        if (selectedCar) {
            const carRef = doc(firestore, 'cars', selectedCar.id);
            await updateDoc(carRef, data);
            toast({ title: "Auto actualizado", description: "Los cambios se guardaron correctamente." });
        } else {
            // Firestore genera el ID automáticamente, la propiedad 'image' debe gestionarse por separado
            await addDoc(collection(firestore, 'cars'), { ...data, image: `image-${Date.now()}` });
            toast({ title: "Auto añadido", description: "El nuevo auto se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Administrar Autos</h1>
            <Button onClick={handleAdd}>Añadir Auto</Button>
        </div>
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="hidden md:table-cell">Año</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {initialCars.map(car => (
                    <TableRow key={car.id}>
                    <TableCell className="font-medium">{car.brand}</TableCell>
                    <TableCell>{car.model}</TableCell>
                    <TableCell className="hidden md:table-cell">{car.year}</TableCell>
                    <TableCell className="text-right">${car.price.toLocaleString('es-MX')}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(car)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => car.id && confirmDelete(car.id)} className="text-destructive">
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
        <CarForm 
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            car={selectedCar}
            onSave={handleSave}
        />
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente el auto de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setCarToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
