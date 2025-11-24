'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Wand2 } from 'lucide-react';
import { virtualAssistantCarRecommendations } from '@/ai/flows/virtual-assistant-car-recommendations';
import { traducciones } from '@/lib/traducciones';

const esquemaFormulario = z.object({
  budget: z.number().min(20000).max(100000),
  primaryUse: z.enum(['Commute', 'Family', 'Performance', 'Off-road']),
  passengers: z.number().min(1).max(7),
  fuelType: z.enum(['Gasoline', 'Hybrid', 'Electric', 'NoPreference']),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

export default function PaginaSimulador() {
  const [recomendacion, setRecomendacion] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      budget: 50000,
      primaryUse: 'Commute',
      passengers: 2,
      fuelType: 'NoPreference',
    },
  });

  const alEnviar = (data: DatosFormulario) => {
    const mapaUsoPrincipal = {
      'Commute': 'transporte diario',
      'Family': 'familiar',
      'Performance': 'rendimiento',
      'Off-road': 'todoterreno'
    };

    const mapaTipoCombustible = {
        'Gasoline': 'gasolina',
        'Hybrid': 'híbrido',
        'Electric': 'eléctrico',
        'NoPreference': 'cualquier tipo'
    }

    const prompt = `Estoy buscando un auto con un presupuesto de alrededor de $${data.budget}. Mi uso principal es para ${mapaUsoPrincipal[data.primaryUse]}. Necesito llevar alrededor de ${data.passengers} pasajeros. En cuanto al tipo de combustible, prefiero ${mapaTipoCombustible[data.fuelType]}.`;

    startTransition(async () => {
      setRecomendacion(null);
      try {
        const result = await virtualAssistantCarRecommendations({ userInput: prompt });
        setRecomendacion(result.recommendation);
      } catch (error) {
        setRecomendacion('Lo siento, algo salió mal. Por favor, inténtalo de nuevo.');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Tus Preferencias</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-8">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presupuesto: ${field.value.toLocaleString()}</FormLabel>
                    <FormControl>
                      <Slider
                        min={20000}
                        max={100000}
                        step={1000}
                        value={[field.value]}
                        onValueChange={vals => field.onChange(vals[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="primaryUse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uso Principal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un uso principal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Commute">Transporte Diario</SelectItem>
                        <SelectItem value="Family">Auto Familiar</SelectItem>
                        <SelectItem value="Performance">Rendimiento/Diversión</SelectItem>
                        <SelectItem value="Off-road">Todoterreno/Aventura</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pasajeros</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="7" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fuelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferencia de Combustible</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Gasoline" id="gasoline" />
                          </FormControl>
                          <FormLabel htmlFor="gasoline" className='font-normal'>{traducciones.fuelType.Gasoline}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Hybrid" id="hybrid" />
                          </FormControl>
                          <FormLabel htmlFor="hybrid" className='font-normal'>{traducciones.fuelType.Hybrid}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Electric" id="electric" />
                          </FormControl>
                          <FormLabel htmlFor="electric" className='font-normal'>{traducciones.fuelType.Electric}</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="NoPreference" id="no-preference" />
                          </FormControl>
                          <FormLabel htmlFor="no-preference" className='font-normal'>Sin Preferencia</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Encontrar Mi Auto
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Card className="w-full min-h-[300px] flex flex-col items-center justify-center shadow-lg">
            <CardHeader>
                <CardTitle>Recomendación de IA</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex-grow flex items-center justify-center">
                {isPending && <Loader className="h-8 w-8 animate-spin text-primary" />}
                {!isPending && !recomendacion && <p className="text-muted-foreground">Tu auto recomendado aparecerá aquí.</p>}
                {!isPending && recomendacion && (
                    <p className="text-lg animate-in fade-in duration-500">{recomendacion}</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
