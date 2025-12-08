'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  number: number;
  title: string;
}

interface WizardStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export default function WizardSteps({ steps, currentStep, className }: WizardStepsProps) {
  return (
    <div className={cn('flex items-start justify-center w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;

        return (
          <div key={step.number} className={cn("flex items-start", index < steps.length - 1 ? 'w-full' : 'flex-shrink-0')}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-300',
                  isCompleted ? 'bg-primary text-primary-foreground' : '',
                  isActive ? 'bg-primary text-primary-foreground' : '',
                  !isCompleted && !isActive ? 'bg-muted text-muted-foreground' : ''
                )}
              >
                {isCompleted ? <Check className="w-6 h-6" /> : step.number}
              </div>
              <p
                className={cn(
                  'text-sm text-center font-medium transition-colors duration-300 w-24',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </p>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-1 mx-4 mt-5 transition-colors duration-300 rounded-full',
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
