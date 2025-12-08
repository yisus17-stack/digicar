
'use client';

import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useMounted } from '@/hooks/use-mounted';

const themes = [
  { name: 'light', icon: Sun },
  { name: 'dark', icon: Moon },
  { name: 'system', icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isMounted = useMounted();

  if (!isMounted) {
    return null; // O un esqueleto de carga si lo prefieres
  }
  
  const activeThemeIndex = themes.findIndex((t) => t.name === theme);

  return (
    <div className="relative flex items-center rounded-full bg-muted p-1 gap-1">
      {themes.map((t, index) => (
        <button
          key={t.name}
          className={cn(
            'relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors',
            theme === t.name
              ? 'text-primary-foreground'
              : 'text-muted-foreground'
          )}
          onClick={() => setTheme(t.name)}
          aria-label={`Switch to ${t.name} theme`}
        >
          <t.icon className="h-5 w-5" />
        </button>
      ))}
      {activeThemeIndex !== -1 && (
        <motion.div
            className="absolute left-1 top-1 z-0 h-9 w-9 rounded-full bg-primary"
            layoutId="theme-switcher-bg"
            initial={false}
            animate={{
            x: activeThemeIndex * 40,
            }}
            transition={{
            type: 'spring',
            stiffness: 350,
            damping: 30,
            }}
        />
      )}
    </div>
  );
}
