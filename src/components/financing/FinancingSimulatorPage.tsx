
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
import { Download, Save, Loader, Eye } from 'lucide-react';
import PaymentChart from './PaymentChart';
import { useToast } from '@/hooks/use-toast';
import { useMounted } from '@/hooks/use-mounted';
import QRCode from 'qrcode';

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const isMounted = useMounted();

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
  const financingType = form.watch('financingType');

  const selectedCar = useMemo(() => cars.find(c => c.id === selectedCarId), [selectedCarId, cars]);
  const maxDownPayment = useMemo(() => selectedCar ? selectedCar.price * 0.9 : 100000, [selectedCar]);

  const generateAndSetPdfUrl = async (currentCar: Car, currentResult: SimulationResult, currentDownPayment: number, currentTerm: number, currentFinancingType: string) => {
    const doc = await generatePdfDoc(currentCar, currentResult, currentDownPayment, currentTerm, currentFinancingType);
    if (doc) {
      const url = doc.output('bloburl');
      setPdfUrl(url.toString());
    } else {
      setPdfUrl(null);
    }
  };

  const generatePdfDoc = async (car: Car, result: SimulationResult, downPayment: number, term: number, financing: string): Promise<jsPDF | null> => {
    if (!car || !result) return null;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 210]
    });
    
    const addContent = (logoBase64: string | ArrayBuffer | null) => {
        if (logoBase64) {
          doc.addImage(logoBase64.toString(), 'PNG', (doc.internal.pageSize.getWidth() - 30) / 2, 10, 30, 10);
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Simulación de Financiamiento", doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

        doc.setDrawColor(200);
        doc.line(10, 32, 70, 32);
        
        doc.setFontSize(8);
        doc.text(`Simulación #${Math.floor(Math.random() * 90000) + 10000}`, 10, 38);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 70, 38, { align: 'right' });


        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text("Vehículo Seleccionado:", 10, 48);
        doc.setFont('helvetica', 'normal');
        doc.text(`${car.brand} ${car.model} ${car.year}`, 10, 53);

        const tableData = [
          ["Precio:", `$${car.price.toLocaleString('es-MX')}`],
          ["Enganche:", `$${downPayment.toLocaleString('es-MX')}`],
          ["Monto a Financiar:", `$${result.principal.toLocaleString('es-MX')}`],
          ["Plazo:", `${term} meses`],
          ["Tasa Anual Fija:", `${(INTEREST_RATE * 100).toFixed(1)}%`],
          ["Tipo:", financing === 'credit' ? 'Crédito' : 'Arrendamiento'],
        ];

        autoTable(doc, {
            startY: 60,
            head: [['Concepto', 'Monto']],
            body: tableData,
            theme: 'striped',
            margin: { left: 10, right: 10 },
            headStyles: { 
                fillColor: [35, 38, 43],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
            },
            styles: { 
                fontSize: 8,
                cellPadding: 2,
            },
            columnStyles: {
                0: { fontStyle: 'bold' },
                1: { halign: 'right' }
            },
        });

        const finalY = (doc as any).lastAutoTable.finalY;

        autoTable(doc, {
            startY: finalY + 5,
            body: [
                ['Intereses Totales:', `$${result.totalInterest.toLocaleString('es-MX')}`],
                ['Costo Total:', `$${result.totalPayment.toLocaleString('es-MX')}`],
            ],
            theme: 'plain', margin: { left: 10, right: 10 },
            styles: { fontSize: 8 },
            columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } },
        });
        
        const primaryColor = '#D4A24E';
        doc.setFillColor(primaryColor);
        doc.rect(10, (doc as any).lastAutoTable.finalY + 2, 60, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text("Pago Mensual Estimado", 12, (doc as any).lastAutoTable.finalY + 8);
        doc.setFontSize(10);
        doc.text(`$${result.monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 68, (doc as any).lastAutoTable.finalY + 8, { align: 'right' });


        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(7);
        doc.setTextColor(150);
        const footerText = "Esta es una simulación y los valores son aproximados. No constituye una oferta formal de crédito. Gracias por usar el simulador de DigiCar.";
        const splitFooter = doc.splitTextToSize(footerText, 60);
        doc.text(splitFooter, doc.internal.pageSize.getWidth() / 2, pageHeight - 15, { align: 'center', baseline: 'bottom' });
    };
    
    try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                addContent(reader.result);
                resolve(doc);
            };
            reader.onerror = () => {
                console.error("Error al leer el logo");
                addContent(null); // Genera el PDF sin logo si hay error
                resolve(doc);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error al cargar el logo para el PDF:", error);
        addContent(null); // Genera el PDF sin logo si hay error
        return doc;
    }
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedCar) return;

    setPdfUrl(null); // Reset pdf url on new calculation

    const principal = selectedCar.price - data.downPayment;
    let result: SimulationResult;

    if (principal <= 0) {
      result = {
        monthlyPayment: 0,
        totalPayment: selectedCar.price,
        totalInterest: 0,
        principal: 0,
      };
    } else {
      const monthlyInterestRate = INTEREST_RATE / 12;
      const monthlyPayment = (principal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, data.term)) / (Math.pow(1 + monthlyInterestRate, data.term) - 1);
      const totalPayment = (monthlyPayment * data.term) + data.downPayment;
      const totalInterest = totalPayment - selectedCar.price;
      result = {
        monthlyPayment,
        totalPayment,
        totalInterest,
        principal,
      };
    }

    setSimulationResult(result);
    await generateAndSetPdfUrl(selectedCar, result, data.downPayment, data.term, data.financingType);
  };
  
  const handleSave = () => {
    toast({
        title: "Simulación Guardada",
        description: "Tu simulación se ha guardado en tu perfil.",
    });
  }

  const handleDownload = async () => {
    if (!selectedCar || !simulationResult) {
        toast({ title: "Error", description: "Por favor, primero genera una simulación.", variant: "destructive" });
        return;
    }
    const doc = await generatePdfDoc(selectedCar, simulationResult, downPaymentValue, selectedTerm, financingType);
    if(doc) {
        doc.save(`simulacion-digicar-${selectedCar.brand}-${selectedCar.model}.pdf`);
    }
  }

  const handlePreview = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast({ title: "Error", description: "El PDF no está listo. Intenta de nuevo.", variant: "destructive" });
    }
  };


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
                    <Select onValueChange={(value) => { field.onChange(value); setSimulationResult(null); setPdfUrl(null); }} defaultValue={field.value}>
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
                    <FormLabel>Enganche Inicial: ${isMounted ? field.value.toLocaleString('es-MX') : field.value}</FormLabel>
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
                    <Save className="mr-2 h-4 w-4" /> Guardar
                </Button>
                 <Button variant="outline" onClick={handlePreview} disabled={!pdfUrl}>
                    <Eye className="mr-2 h-4 w-4" /> Visualizar
                </Button>
                <Button onClick={handleDownload} disabled={!pdfUrl}>
                    <Download className="mr-2 h-4 w-4" /> Descargar PDF
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
