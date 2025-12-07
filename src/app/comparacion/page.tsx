
'use client';

import { Suspense } from 'react';
import ComparisonContent from "@/features/comparison/components/ComparisonContent";
import EsqueletoComparacion from '@/features/comparison/components/EsqueletoComparacion';


export default function Comparar() {
    return (
        <Suspense fallback={<EsqueletoComparacion />}>
            <ComparisonContent />
        </Suspense>
    );
}
