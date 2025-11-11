'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import BrandTable from '@/components/admin/BrandTable';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

function BrandTableSkeleton() {
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

export default function AdminBrandsPage() {
  const firestore = useFirestore();

  const brandsCollection = useMemoFirebase(() => collection(firestore, 'brands'), [firestore]);
  const { data: brands, isLoading: brandsLoading } = useCollection(brandsCollection);

  if (brandsLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <BrandTableSkeleton />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <BrandTable brands={brands ?? []} />
    </div>
  );
}
