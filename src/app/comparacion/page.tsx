
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import ComparisonContent from "@/features/comparison/components/ComparisonContent";

function ComparisonAuthWrapper({ children }: { children: React.ReactNode }) {
    const { user, loading: loadingUser } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loadingUser && !user) {
            router.push('/login?redirect=/comparacion');
        }
    }, [user, loadingUser, router]);

    if (loadingUser || !user) {
        return null;
    }

    return <>{children}</>;
}


export default function Comparar() {
    return (
        <ComparisonAuthWrapper>
            <ComparisonContent />
        </ComparisonAuthWrapper>
    );
}
