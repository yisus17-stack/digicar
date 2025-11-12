'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import FuelTypeTable from '@/components/admin/FuelTypeTable';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function FuelTypeTableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="border rounded-lg">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export default function AdminFuelsPage() {
  const firestore = useFirestore();

  const fuelsCollection = useMemoFirebase(() => collection(firestore, 'fuelTypes'), [firestore]);
  const { data: fuels, isLoading: fuelsLoading } = useCollection(fuelsCollection);

  if (fuelsLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <FuelTypeTableSkeleton />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <FuelTypeTable fuels={fuels ?? []} />
    </div>
  );
}
