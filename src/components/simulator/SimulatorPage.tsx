'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useTransition } from 'react';
import Image from 'next/image';

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

const formSchema = z.object({
  budget: z.number().min(20000).max(100000),
  primaryUse: z.enum(['Commute', 'Family', 'Performance', 'Off-road']),
  passengers: z.number().min(1).max(7),
  fuelType: z.enum(['Gasoline', 'Hybrid', 'Electric', 'NoPreference']),
});

type FormData = z.infer<typeof formSchema>;

export default function SimulatorPage() {
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: 50000,
      primaryUse: 'Commute',
      passengers: 2,
      fuelType: 'NoPreference',
    },
  });

  const onSubmit = (data: FormData) => {
    const prompt = `I'm looking for a car with a budget around $${data.budget}. My primary use is for ${data.primaryUse}. I need to carry about ${data.passengers} passengers. For fuel type, I prefer ${data.fuelType === 'NoPreference' ? 'any type' : data.fuelType}.`;

    startTransition(async () => {
      setRecommendation(null);
      try {
        const result = await virtualAssistantCarRecommendations({ userInput: prompt });
        setRecommendation(result.recommendation);
      } catch (error) {
        setRecommendation('Sorry, something went wrong. Please try again.');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Your Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget: ${field.value.toLocaleString()}</FormLabel>
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
                    <FormLabel>Primary Use</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a primary use" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Commute">Daily Commute</SelectItem>
                        <SelectItem value="Family">Family Car</SelectItem>
                        <SelectItem value="Performance">Performance/Fun</SelectItem>
                        <SelectItem value="Off-road">Off-road/Adventure</SelectItem>
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
                    <FormLabel>Passengers</FormLabel>
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
                    <FormLabel>Fuel Preference</FormLabel>
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
                          <FormLabel htmlFor="gasoline" className='font-normal'>Gasoline</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Hybrid" id="hybrid" />
                          </FormControl>
                          <FormLabel htmlFor="hybrid" className='font-normal'>Hybrid</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="Electric" id="electric" />
                          </FormControl>
                          <FormLabel htmlFor="electric" className='font-normal'>Electric</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="NoPreference" id="no-preference" />
                          </FormControl>
                          <FormLabel htmlFor="no-preference" className='font-normal'>No Preference</FormLabel>
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
                Find My Car
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center">
        <Card className="w-full min-h-[300px] flex flex-col items-center justify-center shadow-lg">
            <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex-grow flex items-center justify-center">
                {isPending && <Loader className="h-8 w-8 animate-spin text-primary" />}
                {!isPending && !recommendation && <p className="text-muted-foreground">Your recommended car will appear here.</p>}
                {!isPending && recommendation && (
                    <p className="text-lg animate-in fade-in duration-500">{recommendation}</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
