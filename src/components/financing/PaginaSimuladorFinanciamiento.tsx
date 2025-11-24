'use client';

import { useState, useMemo } from 'react';
import type { Auto } from '@/lib/types';
import { useForm } from 'react-hook-form';
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
import { Download, Save, Eye } from 'lucide-react';
import GraficoPagos from './PaymentChart';
import { useToast } from '@/hooks/use-toast';
import { useMounted } from '@/hooks/use-mounted';

const esquemaFormulario = z.object({
  carId: z.string().nonempty({ message: 'Por favor, selecciona un vehículo.' }),
  downPayment: z.number().min(0, 'El enganche no puede ser negativo.'),
  term: z.number().min(12, 'El plazo mínimo es de 12 meses.').max(72, 'El plazo máximo es de 72 meses.'),
  financingType: z.enum(['credit', 'lease']),
});

type DatosFormulario = z.infer<typeof esquemaFormulario>;

interface PaginaSimuladorFinanciamientoProps {
  autos: Auto[];
}

interface ResultadoSimulacion {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
}

const TASA_INTERES = 0.125; 

export default function PaginaSimuladorFinanciamiento({ autos }: PaginaSimuladorFinanciamientoProps) {
  const [resultadoSimulacion, setResultadoSimulacion] = useState<ResultadoSimulacion | null>(null);
  const [urlPdf, setUrlPdf] = useState<string | null>(null);
  const { toast } = useToast();
  const estaMontado = useMounted();

  const form = useForm<DatosFormulario>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      carId: '',
      downPayment: 20000,
      term: 36,
      financingType: 'credit',
    },
  });

  const idAutoSeleccionado = form.watch('carId');
  const valorEnganche = form.watch('downPayment');
  const plazoSeleccionado = form.watch('term');
  const tipoFinanciamiento = form.watch('financingType');

  const autoSeleccionado = useMemo(() => autos.find(c => c.id === idAutoSeleccionado), [idAutoSeleccionado, autos]);
  const engancheMaximo = useMemo(() => autoSeleccionado ? autoSeleccionado.price * 0.9 : 100000, [autoSeleccionado]);

  const generarYEstablecerUrlPdf = async (autoActual: Auto, resultadoActual: ResultadoSimulacion, engancheActual: number, plazoActual: number, tipoFinanciamientoActual: string) => {
    const doc = await generarDocumentoPdf(autoActual, resultadoActual, engancheActual, plazoActual, tipoFinanciamientoActual);
    if (doc) {
      const url = doc.output('bloburl');
      setUrlPdf(url.toString());
    } else {
      setUrlPdf(null);
    }
  };

  const generarDocumentoPdf = async (car: Auto, result: ResultadoSimulacion, downPayment: number, term: number, financing: string): Promise<jsPDF | null> => {
    if (!car || !result) return null;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 190]
    });
    
    const agregarContenido = (logoBase64: string | ArrayBuffer | null) => {
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
        
        const now = new Date();
        const date = now.toLocaleDateString('es-MX');
        const time = now.toLocaleTimeString('es-MX');
        doc.text(`Fecha: ${date}`, 70, 38, { align: 'right' });
        doc.text(`Hora: ${time}`, 70, 42, { align: 'right' });


        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text("Vehículo Seleccionado:", 10, 52);
        doc.setFont('helvetica', 'normal');
        doc.text(`${car.brand} ${car.model} ${car.year}`, 10, 57);

        const tableData = [
          ["Precio:", `$${car.price.toLocaleString('es-MX')}`],
          ["Enganche:", `$${downPayment.toLocaleString('es-MX')}`],
          ["Monto a Financiar:", `$${result.principal.toLocaleString('es-MX')}`],
          ["Plazo:", `${term} meses`],
          ["Tasa Anual Fija:", `${(TASA_INTERES * 100).toFixed(1)}%`],
          ["Tipo:", financing === 'credit' ? 'Crédito' : 'Arrendamiento'],
        ];

        autoTable(doc, {
            startY: 64,
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
            columnStyles: { 
                0: { fontStyle: 'bold' }, 
                1: { halign: 'right' } 
            },
        });
        
        const primaryColor = '#ffa802';
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
                agregarContenido(reader.result);
                resolve(doc);
            };
            reader.onerror = () => {
                console.error("Error al leer el logo");
                agregarContenido(null);
                resolve(doc);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error al cargar el logo para el PDF:", error);
        agregarContenido(null);
        return doc;
    }
  }

  const alEnviar = async (data: DatosFormulario) => {
    if (!autoSeleccionado) return;

    setUrlPdf(null); 

    const principal = autoSeleccionado.price - data.downPayment;
    let result: ResultadoSimulacion;

    if (principal <= 0) {
      result = {
        monthlyPayment: 0,
        totalPayment: autoSeleccionado.price,
        totalInterest: 0,
        principal: 0,
      };
    } else {
      const tasaInteresMensual = TASA_INTERES / 12;
      const pagoMensual = (principal * tasaInteresMensual * Math.pow(1 + tasaInteresMensual, data.term)) / (Math.pow(1 + tasaInteresMensual, data.term) - 1);
      const pagoTotal = (pagoMensual * data.term) + data.downPayment;
      const interesTotal = pagoTotal - autoSeleccionado.price;
      result = {
        monthlyPayment: pagoMensual,
        totalPayment: pagoTotal,
        totalInterest: interesTotal,
        principal,
      };
    }

    setResultadoSimulacion(result);
    await generarYEstablecerUrlPdf(autoSeleccionado, result, data.downPayment, data.term, data.financingType);
  };
  
  const manejarGuardado = () => {
    toast({
        title: "Simulación Guardada",
        description: "Tu simulación se ha guardado en tu perfil.",
    });
  }

  const manejarDescarga = async () => {
    if (!autoSeleccionado || !resultadoSimulacion) {
        toast({ title: "Error", description: "Por favor, primero genera una simulación.", variant: "destructive" });
        return;
    }
    const doc = await generarDocumentoPdf(autoSeleccionado, resultadoSimulacion, valorEnganche, plazoSeleccionado, tipoFinanciamiento);
    if(doc) {
        doc.save(`simulacion-digicar-${autoSeleccionado.brand}-${autoSeleccionado.model}.pdf`);
    }
  }

  const manejarVisualizacion = () => {
    if (urlPdf) {
      window.open(urlPdf, '_blank');
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
            <form onSubmit={form.handleSubmit(alEnviar)} className="space-y-6">
              <FormField
                control={form.control}
                name="carId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo de Interés</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setResultadoSimulacion(null); setUrlPdf(null); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un vehículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {autos.map(car => (
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

              {autoSeleccionado && (
                <div className="text-lg font-medium">
                  Precio del vehículo: ${autoSeleccionado.price.toLocaleString('es-MX')}
                </div>
              )}

              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enganche Inicial: ${estaMontado ? field.value.toLocaleString('es-MX') : field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={engancheMaximo}
                        step={1000}
                        value={[field.value]}
                        onValueChange={(vals) => field.onChange(vals[0])}
                        disabled={!autoSeleccionado}
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

              <p className="text-sm text-muted-foreground">Tasa de interés anual fija: { (TASA_INTERES * 100).toFixed(1) }%</p>

              <Button type="submit" className="w-full" disabled={!autoSeleccionado}>
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
            {!resultadoSimulacion && (
              <div className="text-center py-12 text-muted-foreground">
                <p>Completa el formulario para ver los resultados de tu simulación.</p>
              </div>
            )}
            {resultadoSimulacion && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Mensualidad Estimada</p>
                    <p className="text-3xl font-bold">${resultadoSimulacion.monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Costo Total a Pagar</p>
                    <p className="text-2xl font-semibold">${resultadoSimulacion.totalPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Intereses Totales</p>
                    <p className="text-2xl font-semibold">${resultadoSimulacion.totalInterest.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                    <GraficoPagos 
                        principal={resultadoSimulacion.principal}
                        interest={resultadoSimulacion.totalInterest}
                    />
                </div>
              </div>
            )}
          </CardContent>
          {resultadoSimulacion && (
            <CardFooter className="flex-col sm:flex-row flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={manejarGuardado} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> Guardar
                </Button>
                 <Button variant="outline" onClick={manejarVisualizacion} disabled={!urlPdf} className="w-full sm:w-auto">
                    <Eye className="mr-2 h-4 w-4" /> Visualizar
                </Button>
                <Button onClick={manejarDescarga} disabled={!urlPdf} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" /> Descargar PDF
                </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
