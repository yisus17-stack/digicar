'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Accessibility, Text, Contrast, Languages } from 'lucide-react';
import { i18n, type Locale } from '@/i18n-config';

type FontSize = 'small' | 'normal' | 'large';

export default function AccessibilityWidget() {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const pathName = usePathname();
  const router = useRouter();

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  const handleLanguageChange = (newLocale: Locale) => {
    const segments = pathName.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
  };
  
  const currentLocale = pathName.split('/')[1] as Locale;


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          aria-label="Opciones de accesibilidad"
        >
          <Accessibility className="h-7 w-7" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" side="top" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Accesibilidad</h4>
            <p className="text-sm text-muted-foreground">
              Esta sección permite ajustar el contraste, tamaño de fuente, idioma y otros parámetros visuales o de interacción, garantizando una experiencia accesible para todo tipo de usuarios.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                <Label htmlFor="high-contrast">Alto Contraste</Label>
              </div>
              <Switch
                id="high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Text className="h-4 w-4" />
                    <Label>Tamaño de Fuente</Label>
                </div>
              <div className="flex gap-1">
                <Button variant={fontSize === 'small' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFontSize('small')}>A-</Button>
                <Button variant={fontSize === 'normal' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFontSize('normal')}>A</Button>
                <Button variant={fontSize === 'large' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFontSize('large')}>A+</Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    <Label htmlFor="language">Idioma</Label>
                </div>
              <Select value={currentLocale} onValueChange={(value) => handleLanguageChange(value as Locale)}>
                <SelectTrigger id="language" className="w-[120px]">
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  {i18n.locales.map((locale) => (
                     <SelectItem key={locale} value={locale}>
                        {locale === 'es' ? 'Español' : 'English'}
                     </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
