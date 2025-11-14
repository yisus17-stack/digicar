'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import ColorTable from '@/components/admin/ColorTable';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Color } from '@/lib/types';

function ColorTableSkeleton() {
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

export default function AdminColorsPage() {
  const firestore = useFirestore();

  const colorsCollection = useMemoFirebase(() => collection(firestore, 'colors'), [firestore]);
  const { data: colors, isLoading: colorsLoading } = useCollection<Color>(colorsCollection);

  if (colorsLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <ColorTableSkeleton />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ColorTable colors={colors ?? []} />
    </div>
  );
}
