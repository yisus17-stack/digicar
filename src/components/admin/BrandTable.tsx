
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
import type { Brand } from '@/lib/types';
import BrandForm from './BrandForm';
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
import { useFirestore, useStorage } from '@/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { uploadImage } from '@/lib/storage';

interface BrandTableProps {
  brands: Brand[];
}

export default function BrandTable({ brands: initialBrands }: BrandTableProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<string | null>(null);
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();

  const handleAdd = () => {
    setSelectedBrand(null);
    setIsFormOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsFormOpen(true);
  };
  
  const confirmDelete = (brandId: string) => {
    setBrandToDelete(brandId);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!brandToDelete) return;
    const brandRef = doc(firestore, 'brands', brandToDelete);
    deleteDoc(brandRef)
      .then(() => {
        toast({ title: "Marca eliminada", description: "La marca se ha eliminado correctamente." });
      })
      .catch((error) => {
        const contextualError = new FirestorePermissionError({
          operation: 'delete',
          path: brandRef.path,
        });
        errorEmitter.emit('permission-error', contextualError);
      })
      .finally(() => {
        setBrandToDelete(null);
        setIsAlertOpen(false);
      });
  };

  const handleSave = async (data: Omit<Brand, 'id'>, newLogoFile?: File) => {
    try {
        if (selectedBrand) { // Logic for updating an existing brand
            let logoUrl = selectedBrand.logoUrl || '';
            if (newLogoFile) {
                const toastId = toast({ title: 'Actualizando logo...', description: 'Por favor, espera.' });
                logoUrl = await uploadImage(storage, newLogoFile, `brands/${selectedBrand.id}`);
                toastId.dismiss();
            }
            const brandData = { ...data, logoUrl };
            const brandRef = doc(firestore, 'brands', selectedBrand.id);
            await updateDoc(brandRef, brandData);
            toast({ title: "Marca actualizada", description: "Los cambios se guardaron correctamente." });

        } else { // Logic for creating a new brand
            const newBrandRef = doc(collection(firestore, 'brands'));
            const entityId = newBrandRef.id;
            
            let logoUrl = '';
            if (newLogoFile) {
                const toastId = toast({ title: 'Subiendo logo...', description: 'Por favor, espera.' });
                logoUrl = await uploadImage(storage, newLogoFile, `brands/${entityId}`);
                toastId.dismiss();
            }

            const brandData = { ...data, logoUrl, id: entityId };
            await setDoc(newBrandRef, brandData);
            toast({ title: "Marca añadida", description: "La nueva marca se ha añadido a la base de datos." });
        }
    } catch (error: any) {
        toast({ title: "Error", description: `No se pudieron guardar los cambios: ${error.message}`, variant: "destructive" });
        console.error("Error saving brand:", error);
        
        // Optionally emit a more specific error for debugging if it's a permission issue
        if (error.code && error.code.includes('permission-denied')) {
            const contextualError = new FirestorePermissionError({
              operation: selectedBrand ? 'update' : 'create',
              path: selectedBrand ? `brands/${selectedBrand.id}` : 'brands',
              requestResourceData: data,
            });
            errorEmitter.emit('permission-error', contextualError);
        }
    }
  };

  return (
    <>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Administrar Marcas</h1>
            <Button onClick={handleAdd}>Añadir Marca</Button>
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
                {initialBrands.map(brand => (
                    <TableRow key={brand.id}>
                    <TableCell>
                        <Avatar>
                            {brand.logoUrl && <AvatarImage src={brand.logoUrl} alt={brand.name} className="object-contain" />}
                            <AvatarFallback>
                                <Tag className='h-5 w-5' />
                            </AvatarFallback>
                        </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(brand)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => brand.id && confirmDelete(brand.id)} className="text-destructive">
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
        <BrandForm 
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            brand={selectedBrand}
            onSave={handleSave}
        />
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Esto eliminará permanentemente la marca de la base de datos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setBrandToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
