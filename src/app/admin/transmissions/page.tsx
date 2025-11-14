'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useFirestore } from '@/firebase';
import TransmissionTable from '@/components/admin/TransmissionTable';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import type { Transmission } from '@/lib/types';

function TransmissionTableSkeleton() {
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

export default function AdminTransmissionsPage() {
  const firestore = useFirestore();

  const transmissionsCollection = useMemoFirebase(() => collection(firestore, 'transmissions'), [firestore]);
  const { data: transmissions, isLoading: transmissionsLoading } = useCollection<Transmission>(transmissionsCollection);

  if (transmissionsLoading) {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <TransmissionTableSkeleton />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <TransmissionTable transmissions={transmissions ?? []} />
    </div>
  );
}
