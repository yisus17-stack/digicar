'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password?: string;
}

interface ValidationRule {
  id: string;
  regex: RegExp;
  text: string;
}

const validationRules: ValidationRule[] = [
  { id: 'length', regex: /.{8,}/, text: 'Al menos 8 caracteres' },
  { id: 'uppercase', regex: /[A-Z]/, text: 'Una letra mayúscula' },
  { id: 'lowercase', regex: /[a-z]/, text: 'Una letra minúscula' },
  { id: 'number', regex: /[0-9]/, text: 'Un número' },
  { id: 'special', regex: /[^a-zA-Z0-9]/, text: 'Un carácter especial' },
];

export default function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  return (
    <div className="space-y-1">
      {validationRules.map((rule) => {
        const isValid = rule.regex.test(password);
        return (
          <div key={rule.id} className="flex items-center text-sm">
            {isValid ? (
              <Check className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground mr-2" />
            )}
            <span className={cn('transition-colors', isValid ? 'text-foreground' : 'text-muted-foreground')}>
              {rule.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
