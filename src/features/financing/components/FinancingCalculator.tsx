
'use client';

import { useState, useMemo } from 'react';
import type { Car } from '@/core/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import WizardSteps from '@/components/layout/WizardSteps';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader2, Download } from 'lucide-react';

const INTEREST_RATE = 0.12; // Tasa de interés anual fija del 12%

interface FinancingCalculatorProps {
  allCars: Car[];
}

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

export default function FinancingCalculator({ allCars }: FinancingCalculatorProps) {
  const [step, setStep] = useState(1);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const [downPayment, setDownPayment] = useState(200000);
  const [term, setTerm] = useState(24);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const wizardSteps = [
    { number: 1, title: 'Presupuesto' },
    { number: 2, title: 'Vehículo' },
    { number: 3, title: 'Resultado' },
  ];

  const selectedCar = useMemo(() => {
    return allCars.find(c => c.id === selectedCarId);
  }, [selectedCarId, allCars]);

  const carPrice = useMemo(() => {
    if (!selectedCar) return 0;
    return selectedCar.variantes?.[0]?.precio ?? selectedCar.precio ?? 0;
  }, [selectedCar]);

  const maxDownPayment = useMemo(() => carPrice > 0 ? carPrice * 0.9 : 500000, [carPrice]);

  const monthlyPayment = useMemo(() => {
    if (carPrice <= 0 || downPayment >= carPrice) return 0;
    const amountToFinance = carPrice - downPayment;
    const monthlyRate = INTEREST_RATE / 12;
    if (term === 0) return 0;
    const payment = (amountToFinance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term));
    return payment;
  }, [carPrice, downPayment, term]);

  const suggestedCars = allCars;


  const handleCarChange = (id: string) => {
    setSelectedCarId(id);
    const car = allCars.find(c => c.id === id);
    const price = car?.variantes?.[0]?.precio ?? car?.precio ?? 0;
    setDownPayment(price * 0.2);
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const carImage = selectedCar?.variantes?.[0]?.imagenUrl ?? selectedCar?.imagenUrl;

  const isWithinBudget = (car: Car) => {
    const price = car.variantes?.[0]?.precio ?? car.precio ?? 0;
    if (price <= 0) return false;

    const estimatedDownPayment = price * 0.20;
    const amountToFinance = price - estimatedDownPayment;
    const monthlyRate = INTEREST_RATE / 12;
    const estimatedTerm = 60;
    
    const estimatedPayment = (amountToFinance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -estimatedTerm));

    return estimatedPayment <= monthlyBudget;
  };
  
    const generatePDF = async () => {
    if (!selectedCar) return;
    setIsGeneratingPdf(true);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Función para obtener la imagen como Base64
    const getImageBase64 = async (url: string) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
          console.error("Error fetching image for PDF:", e);
          return null;
      }
    };
    
    const digicarLogoB64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMjAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDApIj4KPHBhdGggZD0iTTkuOTM0MzcgMjguNjU2MkM4LjEyMDYyIDI4LjY1NjIgNi42Mzc1IDI5LjY1ODEgNi42Mzc1IDMyLjA2MjVDNi42Mzc1IDM0LjQ2NjkgOC4xMjA2MiAzNS40NjI1IDkuOTM0MzcgMzUuNDYyNUwxMy41MTg3IDM1LjQ4MTJMMTMuNTE4NyA0MC4xODEySDEwLjEwOTRDNC44MjAzMSA0MC4xODEyIDEuMTY1NjIgMzcuMjM3NSAxLjE2NTYyIDMyLjA2MjVDMS4xNjU2MiAyNi44ODc1IDQuODIwMzEgMjMuOTYyNSA5Ljk5MDYyIDIzLjk2MjVIMTMuNTE4N1YyOC42NTYySDkuOTM0MzdaIiBmaWxsPSIjNTk1Qzk3Ii8+CjxwYXRoIGQ9Ik0yMC4xNDY5IDI0LjM1OTRIMjQuNjY1NlY0MC4xODEySDIwLjE0NjlWMjQuMzU5NFoiIGZpbGw9IiM1OTVDOTciLz4KPHBhdGggZD0iTTM1Ljg0MDYgMzIuMDYyNUMzNS44NDA2IDM3LjIzNzUgMzIuMTg0NCA0MC4xODEyIDI2Ljk1NjIgNDAuMTgxMkMyMS43MjgxIDQwLjE4MTIgMTguMDcxOSA MzcuMjM3NSAxOC4wNzE5IDMyLjA2MjVDMTguMDcxOSAyNi45MDYzIDIxLjcyODEgMjQuMDAzMSAyNi45NTYyIDI0LjAwMzFDMzIuMTg0NCAyNC4wMDMxIDM1Ljg0MDYgMjYuOTA2MyAzNS44NDA2IDMyLjA2MjVaTTMxLjMxNTYgMzIuMDYyNUMzMS4zMTU2IDI4Ljk4NzUgMjkuNDI1IDI3LjI4NDQgMjYuOTU2MiAyNy4yODQ0QzI0LjQ4NzUgMjcuMjg0NCAyMi41OTY5IDI4Ljk4NzUgMjIuNTk2OSAzMi4wNjI1QzIyLjU5NjkgMzUuMTM3NSAyNC40ODc1IDM2Ljg0MDYgMjYuOTU2MiAzNi44NDA2QzI5LjQyNSAzNi44NDA2IDMxLjMxNTYgMzUuMTM3NSAzMS4zMTU2IDMyLjA2MjVaIiBmaWxsPSIjNTk1Qzk3Ii8+CjxwYXRoIGQ9Ik0zOS4xMjE5IDQwLjE4MTJDMzkuMTIxOSAyMy45MDYzIDM5LjEyMTkgMjMuOTA2MyAzOS4xMjE5IDIzLjkwNjNWMjMuOTA2M0gzOS4xMjE5QzQ0LjQ2NTYgMjMuOTA2MyA0OC4wNjU2IDI2Ljc3NSA0OC4wNjU2IDMyLjA2MjVDNDguMDY1十六章MzczLjI1NDQgNDcuMTMyOCAzNC4yNSA0Ni4xMTU2IDM1LjI0MDZMMC4wMTg3NSA0MC4yOTY5TDU0Ljk4NDQgNDAuMTEyNUw1NC45ODQ0IDQwLjE4MTJMMzkuMTIxOSA0MC4xODEyWk00My41ODQ0IDMyLjA2MjVDNDMuNTg0NCAyOS4zMzQ0IDQxLjg0MDYgMjguMTgxMiA0MC4yMjE5IDI4LjE4MTJDMzkuNDQ2OSAyOC4xODEyIDM4LjY3MTkgMjguNDQ2OSAzNy44OTY5IDI4LjcyNUwzOS4xMjE5IDI4LjcyNVYyOC42NTYySDM5LjEyMTlDMzkuMTIxOSAyOC42NTYyIDM5LjEyMTkgMzUuNDYyNSAzOS4xMjE5IDM1LjQ2MjVWMzUuNDYyNUgzOS4xMjE5QzQwLjkyODEgMzUuNDYyNSA0My41ODQ0IDM0LjQzMTIgNDMuNTg0NCAzMi4wNjI1WiIgZmlsbD0iIzU5NUM5NyIvPgo8cGF0aCBkPSJNNjMuNjA2MyAyNC4wMDMxSDY4LjE2MjVMODAuMTg0NCA0MC4xODEySDc1LjM2NTZMNzMuNjYyNSAzNi4yMDkzSDYyLjU3MTlMNjAuNzU5NCA0MC4xODEySDU2LjA4NDRMNjMuNjA2MyAyNC4wMDMxWk03MS45MTU2IDMyLjYyODFMNjguMDI4MSAyNi4yMjVMODYuMjE1NiAzMi42MjgxSDcxLjkxNTZaIiBmaWxsPSIjNTk1Qzk3Ii8+CjxwYXRoIGQ9Ik05NC4wMjE5IDQwLjE4MTJIODkuNTAzMVYyOC4zNzE5TDg0LjM1IDM2LjE3MTlMODQuMjkzNyAzNi4yMDkzSDg0LjIzNzVMNzkuMTAzMSAyOC4zNzE5VjQwLjE4MTJINzQuNTg0NFYyNC4wMDMxSDc5LjQwOTRMODYuMjczNCAzMy4zNTMxTDg2LjMyMTkgMzMuMzg3NUw5MS4wNTMxIDI0LjAwMzFIOTUuOTEyNVY0MC4xODEySDk0LjAyMTlaIiBmaWxsPSIjNTk1Qzk3Ii8+CjxwYXRoIGQ9Ik0xMDkuOTU2IDMyLjA2MjVDMTA5Ljk1NiAzNy4yMzc1IDEwNi4zMDIgNDAuMTgxMiAxMDEuMDczIDQwLjE4MTJDOTUuODQzNyA0MC4xODEyIDkyLjE4NzUgMzcuMjM3NSA5Mi4xODc1IDMyLjA2MjVDOTIuMTg3NSAyNi45MDYzIDk1Ljg0MzcgMjQuMDAzMSAxMDEuMDczIDI0LjAwMzFDMTA2LjMwMiAyNC4wMDMxIDEwOS45NTYgMjYuOTA2MyAxMDkuOTU2IDMyLjA2MjVaTTExNC40NzUgMzIuMDYyNUMxMTQuNDc1IDI4Ljk4NzUgMTEyLjU4NCAyNy4yODQ0IDExMC4xMTYgMjcuMjg0NEMxMDcuNjQ3IDI3LjI4NDQgMTA1LjM3MiAyOS4zNTMxIDEwNC43OTQgMzIuMDYyNUMxMDUuMzcyIDM0Ljc2MjUgMTA3LjY0NyAzNi44NDA2IDExMC4xMTYgMzYuODQwNkMxMTIuNTg0IDM2Ljg0MDYgMTE0LjQ3NSAzNS4xMzc1IDExNC40NzUgMzIuMDYyNVoiIGZpbGw9IiM1OTVDOTciLz4KPHBhdGggZD0iTTEyNi42NTYgMjQuMDAzMUwxMjAuNjg3IDQwLjE4MTJIMTE2LjA1TDExOS4zMzQgMzMuMTMyOEgxMTkuMzc1TDExNi4xNjYgNDAuMTgxMkgxMTEuNTMxTDEwNy4xNzIgMjQuMDAzMUgxMTEuODA2TDExNC4wOTcgMzEuMTk2OUwxMTQuMTU2IDMxLjIzMTJIMTE0LjIxMkwxMTcuNDE2IDI0LjAwMzFIMTIxLjk5MUwxMTguOTUgMzEuMTEyNUwxMTkuMDAzIDMxLjE0NjlMMTE5LjA2NiAzMS4xMTI1TDEyMi4xNjIgMjQuMDAzMUgxMjYuNjU2WiIgZmlsbD0iIzU5NUM5NyIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwIj4KPHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSI2MCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K";

    doc.addImage(digicarLogoB64, 'PNG', 15, 15, 60, 20);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotización de Financiamiento', pageWidth / 2, 50, { align: 'center' });

    if(carImage) {
        const imageBase64 = await getImageBase64(carImage);
        if (imageBase64) {
            doc.addImage(imageBase64, 'PNG', 15, 65, 80, 50, '', 'FAST');
        }
    }
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${selectedCar.marca} ${selectedCar.modelo}`, 105, 85);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedCar.anio} • ${selectedCar.tipo}`, 105, 95);


    doc.autoTable({
        startY: 130,
        head: [['Concepto', 'Monto']],
        body: [
            ['Precio del Vehículo', `$ ${carPrice.toLocaleString('es-MX')}`],
            ['Enganche', `$ ${downPayment.toLocaleString('es-MX')}`],
            ['Monto a Financiar', `$ ${(carPrice - downPayment).toLocaleString('es-MX')}`],
            ['Plazo', `${term} meses`],
            ['Tasa de Interés Anual Fija', `${(INTEREST_RATE * 100).toFixed(0)}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [89, 92, 151], textColor: [255, 255, 255] },
        didParseCell: (data) => {
            if (data.row.index === 4) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });
    
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Pago Mensual Estimado:', 15, finalY);
    doc.setFontSize(18);
    doc.setTextColor(89, 92, 151); // Primary color
    doc.text(`$ ${monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 15, finalY + 8);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      '*Este documento es una cotización preliminar y no constituye una oferta de crédito. Los montos son estimados y están sujetos a aprobación crediticia y pueden variar sin previo aviso. Tasa de interés anual fija del 12%.',
      15,
      doc.internal.pageSize.getHeight() - 15
    );

    doc.save(`Cotizacion-${selectedCar.marca}-${selectedCar.modelo}.pdf`);
    setIsGeneratingPdf(false);
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
        <WizardSteps steps={wizardSteps} currentStep={step} className="mb-12" />

        {step === 1 && (
            <Card className="animate-in fade-in-50 duration-500">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">¿Cuál es tu presupuesto mensual?</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8 text-center">
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Indícanos cuánto te gustaría pagar al mes para poder mostrarte opciones que se ajusten a tu bolsillo.
                    </p>
                    <div className="space-y-4 max-w-sm mx-auto">
                        <div className="flex justify-center items-baseline">
                            <span className="font-bold text-4xl text-primary">$ {monthlyBudget.toLocaleString('es-MX')}</span>
                        </div>
                        <Slider
                            id="monthly-budget"
                            min={1000}
                            max={50000}
                            step={500}
                            value={[monthlyBudget]}
                            onValueChange={(vals) => setMonthlyBudget(vals[0])}
                        />
                    </div>
                    <Button onClick={handleNextStep} size="lg">
                        Siguiente
                    </Button>
                </CardContent>
            </Card>
        )}

        {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start animate-in fade-in-50 duration-500">
                <div className="lg:col-span-2 space-y-6 sticky top-24">
                    <Select onValueChange={handleCarChange} value={selectedCarId}>
                        <SelectTrigger className="w-full h-12 text-base">
                            <SelectValue placeholder="Selecciona un auto" />
                        </SelectTrigger>
                        <SelectContent>
                            {suggestedCars.map(car => {
                                const variant = car.variantes?.[0];
                                const imageUrl = variant?.imagenUrl ?? car.imagenUrl;
                                const inBudget = isWithinBudget(car);
                                return (
                                    <SelectItem key={car.id} value={car.id}>
                                        <div className="flex items-center gap-3">
                                            {imageUrl && (
                                                <div className="relative h-10 w-10 flex-shrink-0">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={car.modelo}
                                                        fill
                                                        className="rounded-md object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span>{car.marca} {car.modelo}</span>
                                                {inBudget && <span className="text-xs text-green-600 font-medium">Dentro de tu presupuesto</span>}
                                            </div>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="aspect-[16/10] bg-white dark:bg-background rounded-lg flex items-center justify-center">
                                {carImage ? (
                                    <Image
                                        src={carImage}
                                        alt={selectedCar?.modelo ?? 'Auto seleccionado'}
                                        width={600}
                                        height={400}
                                        className="object-contain h-full w-full"
                                    />
                                ) : (
                                   <div className="w-full h-full min-h-[170px]" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3">
                    <Card>
                        <CardContent className="p-8 space-y-8">
                            <div>
                                <Label htmlFor="car-price" className="text-muted-foreground">Precio del vehículo</Label>
                                <Input
                                    id="car-price"
                                    readOnly
                                    value={selectedCar ? `$ ${carPrice.toLocaleString('es-MX')}`: '-'}
                                    className="text-2xl font-bold h-12 mt-2 bg-transparent border-0 px-0"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <Label htmlFor="down-payment">Enganche</Label>
                                    <span className="font-bold text-lg">$ {downPayment.toLocaleString('es-MX')}</span>
                                </div>
                                <Slider
                                    id="down-payment"
                                    min={0}
                                    max={maxDownPayment}
                                    step={1000}
                                    value={[downPayment]}
                                    onValueChange={(vals) => setDownPayment(vals[0])}
                                    disabled={!selectedCar}
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-baseline">
                                    <Label htmlFor="term">Plazo</Label>
                                    <span className="font-bold text-lg">{term} meses</span>
                                </div>
                                <Slider
                                    id="term"
                                    min={12}
                                    max={72}
                                    step={12}
                                    value={[term]}
                                    onValueChange={(vals) => setTerm(vals[0])}
                                    disabled={!selectedCar}
                                />
                            </div>

                             <div className="border-t pt-8 flex justify-between">
                                <Button variant="outline" onClick={handlePrevStep}>Atrás</Button>
                                <Button onClick={handleNextStep} disabled={!selectedCar}>Calcular Pago</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )}

        {step === 3 && (
             <Card className="animate-in fade-in-50 duration-500">
                 <CardHeader className="text-center">
                    <CardTitle className="text-2xl">¡Este es tu plan!</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8 text-center">
                     <p className="text-muted-foreground">Tu pago mensual estimado para un {selectedCar?.marca} {selectedCar?.modelo} es:</p>
                    <p className="text-6xl font-bold text-primary tracking-tight mt-2">
                        $ {monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        *Cálculo aproximado con un enganche de ${downPayment.toLocaleString('es-MX')} a {term} meses y una tasa de interés anual fija del {INTEREST_RATE * 100}%.
                    </p>
                    <div className="pt-8 flex justify-center gap-4">
                        <Button variant="outline" onClick={handlePrevStep}>Ajustar Plan</Button>
                        <Button size="lg" onClick={generatePDF} disabled={isGeneratingPdf}>
                            {isGeneratingPdf ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="mr-2 h-4 w-4" />
                            )}
                            Descargar Cotización (PDF)
                        </Button>
                    </div>
                </CardContent>
             </Card>
        )}
    </div>
  );
}
