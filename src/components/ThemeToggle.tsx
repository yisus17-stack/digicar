
'use client';

import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const themes = [
  { name: 'light', icon: Sun },
  { name: 'dark', icon: Moon },
  { name: 'system', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="relative flex items-center rounded-full bg-muted p-1 gap-1">
      {themes.map((t) => (
        <button
          key={t.name}
          className={cn(
            'relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors',
            { 'text-primary-foreground dark:text-primary': theme === t.name }
          )}
          onClick={() => setTheme(t.name)}
          aria-label={`Switch to ${t.name} theme`}
        >
          <t.icon className="h-5 w-5" />
        </button>
      ))}
      <motion.div
        className="absolute left-1 top-1 z-0 h-9 w-9 rounded-full bg-primary"
        layoutId="theme-switcher-bg"
        initial={false}
        animate={{
          x: themes.findIndex((t) => t.name === theme) * 40,
        }}
        transition={{
          type: 'spring',
          stiffness: 350,
          damping: 30,
        }}
      />
    </div>
  );
}
