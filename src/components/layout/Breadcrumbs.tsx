'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbProps) {
  return (
    <div className="mb-4">
        <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary font-medium hover:underline">
            Inicio
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        {items.map((item, index) => (
            <div key={index} className="flex items-center">
            {item.href ? (
                <Link href={item.href} className="font-medium hover:underline text-primary">
                {item.label}
                </Link>
            ) : (
                <span className="font-medium text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
            </div>
        ))}
        </div>
    </div>
  );
}
