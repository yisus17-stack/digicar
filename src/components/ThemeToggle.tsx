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
  const [effectiveTheme, setEffectiveTheme] = React.useState(theme);

  React.useEffect(() => {
    // We need to resolve the "system" theme to "light" or "dark" to apply the correct color
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      }
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
      setEffectiveTheme(systemTheme.matches ? 'dark' : 'light');
      systemTheme.addEventListener('change', handleSystemThemeChange);
      return () => systemTheme.removeEventListener('change', handleSystemThemeChange);
    } else {
      setEffectiveTheme(theme);
    }
  }, [theme]);


  return (
    <div className="relative flex items-center rounded-full bg-muted p-1">
      {themes.map((t) => (
        <button
          key={t.name}
          className={cn(
            'relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors',
            { 'text-primary-foreground': theme === t.name }
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
          x: themes.findIndex((t) => t.name === theme) * 44, // 44px is w-9 + p-1 on each side
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
