'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import CarTable from '@/components/admin/CarTable';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Car, Brand, Color, Transmission } from '@/lib/types';
import DatabaseSeeder from '@/components/admin/DatabaseSeeder';

function CarTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="border rounded-lg">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function AdminCarsPage() {
  const firestore = useFirestore();

  const carsCollection = useMemoFirebase(() => collection(firestore, 'cars'), [firestore]);
  const { data: cars, isLoading: carsLoading } = useCollection<Car>(carsCollection);

  const brandsCollection = useMemoFirebase(() => collection(firestore, 'brands'), [firestore]);
  const { data: brands, isLoading: brandsLoading } = useCollection<Brand>(brandsCollection);

  const colorsCollection = useMemoFirebase(() => collection(firestore, 'colors'), [firestore]);
  const { data: colors, isLoading: colorsLoading } = useCollection<Color>(colorsCollection);
  
  const transmissionsCollection = useMemoFirebase(() => collection(firestore, 'transmissions'), [firestore]);
  const { data: transmissions, isLoading: transmissionsLoading } = useCollection<Transmission>(transmissionsCollection);

  if (carsLoading || brandsLoading || colorsLoading || transmissionsLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <CarTableSkeleton />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <CarTable cars={cars ?? []} brands={brands ?? []} colors={colors ?? []} transmissions={transmissions ?? []} />
      <DatabaseSeeder />
    </div>
  );
}
