
'use client';

import { Suspense } from 'react';
import ComparisonContent from "@/features/comparison/components/ComparisonContent";
import { Loader2 } from 'lucide-react';


export default function Comparar() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ComparisonContent />
        </Suspense>
    );
}
