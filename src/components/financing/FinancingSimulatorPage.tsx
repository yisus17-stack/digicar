
'use client';

import { useState, useMemo } from 'react';
import type { Car } from '@/lib/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Download, Save, Loader } from 'lucide-react';
import PaymentChart from './PaymentChart';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  carId: z.string().nonempty({ message: 'Por favor, selecciona un vehículo.' }),
  downPayment: z.number().min(0, 'El enganche no puede ser negativo.'),
  term: z.number().min(12, 'El plazo mínimo es de 12 meses.').max(72, 'El plazo máximo es de 72 meses.'),
  financingType: z.enum(['credit', 'lease']),
});

type FormData = z.infer<typeof formSchema>;

interface FinancingSimulatorPageProps {
  cars: Car[];
}

interface SimulationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
}

const INTEREST_RATE = 0.125; // Tasa de interés anual fija del 12.5%

export default function FinancingSimulatorPage({ cars }: FinancingSimulatorPageProps) {
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carId: '',
      downPayment: 20000,
      term: 36,
      financingType: 'credit',
    },
  });

  const selectedCarId = form.watch('carId');
  const downPaymentValue = form.watch('downPayment');
  const selectedTerm = form.watch('term');

  const selectedCar = useMemo(() => cars.find(c => c.id === selectedCarId), [selectedCarId, cars]);
  const maxDownPayment = useMemo(() => selectedCar ? selectedCar.price * 0.9 : 100000, [selectedCar]);

  const onSubmit = (data: FormData) => {
    if (!selectedCar) return;

    const principal = selectedCar.price - data.downPayment;
    if (principal <= 0) {
      setSimulationResult({
        monthlyPayment: 0,
        totalPayment: selectedCar.price,
        totalInterest: 0,
        principal: 0,
      });
      return;
    }
    
    const monthlyInterestRate = INTEREST_RATE / 12;
    const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, data.term)) / (Math.pow(1 + monthlyInterestRate, data.term) - 1);
    const totalPayment = (monthlyPayment * data.term) + data.downPayment;
    const totalInterest = totalPayment - selectedCar.price;

    setSimulationResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal,
    });
  };
  
  const handleSave = () => {
    toast({
        title: "Simulación Guardada",
        description: "Tu simulación se ha guardado en tu perfil.",
    });
  }

  const handleDownload = () => {
    if (!selectedCar || !simulationResult) {
      toast({
        title: "Error",
        description: "Por favor, primero genera una simulación.",
        variant: "destructive"
      });
      return;
    }

    const doc = new jsPDF();
    
    doc.text("Resumen de Financiamiento - DigiCar", 14, 20);
    doc.setFontSize(12);
    doc.text(`Vehículo: ${selectedCar.brand} ${selectedCar.model} ${selectedCar.year}`, 14, 30);

    const tableData = [
      ["Precio del Vehículo", `$${selectedCar.price.toLocaleString('es-MX')}`],
      ["Enganche Inicial", `$${downPaymentValue.toLocaleString('es-MX')}`],
      ["Monto a Financiar (Capital)", `$${simulationResult.principal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ["Plazo", `${selectedTerm} meses`],
      ["Tasa de Interés Anual", `${(INTEREST_RATE * 100).toFixed(1)}%`],
      ["", ""], // Separador
      ["Pago Mensual Estimado", `$${simulationResult.monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ["Total de Intereses", `$${simulationResult.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ["Costo Total del Vehículo", `$${simulationResult.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Concepto', 'Monto']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [35, 84, 51] }, // Color primario
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });

    doc.setFontSize(10);
    doc.text("Nota: Esta es una simulación y los valores son aproximados. No constituye una oferta formal.", 14, (doc as any).lastAutoTable.finalY + 10);


    doc.save("simulacion-digicar.pdf");
  }


  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader>
          <CardTitle>Configura tu Financiamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="carId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo de Interés</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cars.map(car => (
                          <SelectItem key={car.id} value={car.id}>
                            {car.brand} {car.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCar && (
                <div className="text-lg font-medium">
                  Precio del vehículo: ${selectedCar.price.toLocaleString('es-MX')}
                </div>
              )}

              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enganche Inicial: ${field.value.toLocaleString('es-MX')}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={maxDownPayment}
                        step={1000}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        disabled={!selectedCar}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plazo de Pago: {field.value} meses</FormLabel>
                    <FormControl>
                      <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el plazo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12">12 meses</SelectItem>
                          <SelectItem value="24">24 meses</SelectItem>
                          <SelectItem value="36">36 meses</SelectItem>
                          <SelectItem value="48">48 meses</SelectItem>
                          <SelectItem value="60">60 meses</SelectItem>
                          <SelectItem value="72">72 meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="financingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Financiamiento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="credit">Crédito Automotriz</SelectItem>
                        <SelectItem value="lease">Arrendamiento</SelectItem>
                        </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <p className="text-sm text-muted-foreground">Tasa de interés anual fija: { (INTEREST_RATE * 100).toFixed(1) }%</p>

              <Button type="submit" className="w-full" disabled={!selectedCar}>
                Calcular Mensualidad
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Resultados de la Simulación</CardTitle>
            <CardDescription>
                Estos son los costos estimados para tu plan de financiamiento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!simulationResult && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Completa el formulario para ver los resultados de tu simulación.</p>
              </div>
            )}
            {simulationResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Mensualidad Estimada</p>
                    <p className="text-3xl font-bold">${simulationResult.monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Costo Total a Pagar</p>
                    <p className="text-2xl font-semibold">${simulationResult.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Intereses Totales</p>
                    <p className="text-2xl font-semibold">${simulationResult.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                    <PaymentChart 
                        principal={simulationResult.principal}
                        interest={simulationResult.totalInterest}
                    />
                </div>
              </div>
            )}
          </CardContent>
          {simulationResult && (
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleSave}>
                    <Save className="mr-2" /> Guardar
                </Button>
                <Button onClick={handleDownload}>
                    <Download className="mr-2" /> Descargar PDF
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
