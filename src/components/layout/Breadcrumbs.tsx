
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface MigasDePanProps {
  items: { label: string; href?: string }[];
}

export default function MigasDePan({ items }: MigasDePanProps) {
  return (
    <nav className="mb-4 overflow-x-auto whitespace-nowrap py-1">
        <div className="flex items-center text-sm text-muted-foreground">
        <Link href="/" className="text-primary font-medium hover:underline flex-shrink-0">
            Inicio
        </Link>
        <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
        {items.map((item, index) => (
            <React.Fragment key={index}>
            {item.href ? (
                <Link href={item.href} className="font-medium hover:underline text-primary flex-shrink-0">
                {item.label}
                </Link>
            ) : (
                <span className="font-medium text-foreground truncate">{item.label}</span>
            )}
            {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />}
            </React.Fragment>
        ))}
        </div>
    </nav>
  );
}
