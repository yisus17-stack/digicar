
'use client';

import { Suspense } from 'react';
import ComparisonContent from "@/features/comparison/components/ComparisonContent";
import { Spinner } from '@/components/ui/spinner';


export default function Comparar() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Spinner />
            </div>
        }>
            <ComparisonContent />
        </Suspense>
    );
}
