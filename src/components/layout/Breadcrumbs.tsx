
'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React from 'react';

interface MigasDePanProps {
  items: { label: string; href?: string }[];
}

export default function MigasDePan({ items }: MigasDePanProps) {
  return (
    <div className="mb-4">
        <div className="flex items-center text-sm text-muted-foreground flex-wrap">
        <Link href="/" className="text-primary font-medium hover:underline">
            Inicio
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        {items.map((item, index) => (
            <React.Fragment key={index}>
            {item.href ? (
                <Link href={item.href} className="font-medium hover:underline text-primary">
                {item.label}
                </Link>
            ) : (
                <span className="font-medium text-foreground">{item.label}</span>
            )}
            {index < items.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
            </React.Fragment>
        ))}
        </div>
    </div>
  );
}
