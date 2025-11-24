'use client';

import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ResumenIAProps {
  summary: string;
}

export default function ResumenIA({ summary }: ResumenIAProps) {
  if (!summary) return null;

  return (
    <Card className="mb-8 bg-primary/5 border-primary/20 shadow-sm animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-primary">
          <Sparkles className="h-5 w-5" />
          Recomendación de IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}
