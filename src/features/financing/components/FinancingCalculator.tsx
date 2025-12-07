

'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Car, CarVariant } from '@/core/types';
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
import { Loader2, Download, Save } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { Skeleton } from '@/components/ui/skeleton';

const INTEREST_RATE = 0.12;

interface FinancingCalculatorProps {
  allCars: Car[];
}

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

const EsqueletoFinanciamiento = () => (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Skeleton className="h-8 w-1/4 mb-12" />
        <div className="text-center mb-12">
            <Skeleton className="h-12 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
        </div>
        <Skeleton className="h-96 w-full" />
    </div>
);


export default function FinancingCalculator({ allCars }: FinancingCalculatorProps) {
  const [step, setStep] = useState(1);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(undefined);
  const [downPayment, setDownPayment] = useState(200000);
  const [term, setTerm] = useState(24);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const router = useRouter();


  const wizardSteps = [
    { number: 1, title: 'Presupuesto' },
    { number: 2, title: 'Vehículo' },
    { number: 3, title: 'Resultado' },
  ];
  
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push('/login?redirect=/financiamiento');
    }
  }, [user, loadingUser, router]);

  const resetCalculator = () => {
    setStep(1);
    setMonthlyBudget(5000);
    setSelectedCarId(undefined);
    setSelectedVariantId(undefined);
    setDownPayment(200000);
    setTerm(24);
  };


  const selectedCar = useMemo(() => {
    return allCars.find(c => c.id === selectedCarId);
  }, [selectedCarId, allCars]);

  const selectedVariant = useMemo(() => {
    if (!selectedCar || !selectedCar.variantes || selectedCar.variantes.length === 0) return null;
    if (selectedVariantId) {
      return selectedCar.variantes.find(v => v.id === selectedVariantId);
    }
    // Si no hay variante seleccionada, por defecto la primera
    return selectedCar.variantes[0];
  }, [selectedCar, selectedVariantId]);

  const carPrice = useMemo(() => {
    if (selectedVariant) return selectedVariant.precio;
    if (selectedCar) return selectedCar.variantes?.[0]?.precio ?? selectedCar.precio ?? 0;
    return 0;
  }, [selectedCar, selectedVariant]);
  
  useEffect(() => {
    if (selectedCar && selectedCar.variantes && selectedCar.variantes.length > 0) {
      setSelectedVariantId(selectedCar.variantes[0].id);
    } else {
      setSelectedVariantId(undefined);
    }
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
    // Reset variant when car changes
    setSelectedVariantId(car?.variantes?.[0]?.id);
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const carImage = selectedVariant?.imagenUrl ?? selectedCar?.variantes?.[0]?.imagenUrl ?? selectedCar?.imagenUrl;

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
  
  const handleSaveFinancing = async () => {
    if (!user) {
        router.push('/login?redirect=/financiamiento');
        return;
    }
    if (!selectedCar || !selectedVariant) return;

    setIsSaving(true);
    try {
        const financingData = {
            usuarioId: user.uid,
            autoId: selectedCar.id,
            varianteId: selectedVariant.id,
            precioAuto: carPrice,
            enganche: downPayment,
            plazo: term,
            pagoMensual: monthlyPayment,
            fechaCreacion: serverTimestamp(),
        };

        await addDoc(collection(firestore, 'financiamientos'), financingData);
        
        await Swal.fire({
            title: '¡Guardado!',
            text: 'Tu plan de financiamiento ha sido guardado en tu perfil.',
            icon: 'success',
            confirmButtonColor: '#595c97',
        });
        
        resetCalculator();
        router.push('/perfil?tab=financings');

    } catch (error) {
        console.error("Error guardando financiamiento:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo guardar el financiamiento. Inténtalo de nuevo.',
            icon: 'error',
            confirmButtonColor: '#595c97',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    if (!selectedCar) return;
    setIsGeneratingPdf(true);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

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
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Cotización de Financiamiento', 15, 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Aquí tienes un resumen detallado de tu plan de financiamiento personalizado.', 15, 28);
    
    let currentY = 45;

    if(user) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Preparado para:', 15, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(user.displayName || 'N/A', 15, currentY + 5);
        doc.text(user.email || 'N/A', 15, currentY + 10);
        currentY += 25;
    }


    if(carImage) {
        const imageBase64 = await getImageBase64(carImage);
        if (imageBase64) {
            doc.addImage(imageBase64, 'PNG', 15, currentY, 80, 0, '', 'FAST');
        }
    }
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${selectedCar.marca} ${selectedCar.modelo}`, 105, currentY + 15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedCar.anio} • ${selectedCar.tipo}`, 105, currentY + 23);

    currentY += 65;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Especificaciones del Vehículo', 15, currentY);
    doc.autoTable({
        startY: currentY + 5,
        head: [['Especificación', 'Valor']],
        body: [
            ['Combustible', selectedCar.tipoCombustible],
            ['Transmisión', selectedCar.transmision],
            ['Cilindros', `${selectedCar.cilindrosMotor}`],
            ['Pasajeros', `${selectedCar.pasajeros}`],
            ['Color', selectedVariant?.color ?? selectedCar.variantes?.[0]?.color ?? '-'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [244, 244, 245] , textColor: [20, 20, 20] },
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de Financiamiento', 15, finalY);

    doc.autoTable({
        startY: finalY + 5,
        head: [['Concepto', 'Monto']],
        body: [
            ['Precio del Vehículo', `$ ${carPrice.toLocaleString('es-MX')}`],
            ['Enganche', `$ ${downPayment.toLocaleString('es-MX')}`],
            ['Monto a Financiar', `$ ${(carPrice - downPayment).toLocaleString('es-MX')}`],
            ['Plazo', `${term} meses`],
            ['Tasa de Interés Anual Fija', `${(INTEREST_RATE * 100).toFixed(0)}%`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [244, 244, 245], textColor: [20, 20, 20] },
    });
    
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Pago Mensual Estimado:', 15, finalY);
    doc.setFontSize(18);
    doc.setTextColor(89, 92, 151);
    doc.text(`$ ${monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 15, finalY + 8);
    doc.setTextColor(0);

    finalY += 25;
    
    const disclaimer = `*Este documento es una cotización preliminar de DigiCar y no constituye una oferta de crédito. Los montos son estimados y están sujetos a aprobación crediticia y pueden variar sin previo aviso. Tasa de interés anual fija del ${(INTEREST_RATE * 100).toFixed(0)}%.`;
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 30);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(splitDisclaimer, 15, finalY, {align: 'left'});

    doc.save(`Cotizacion-${selectedCar.marca}-${selectedCar.modelo}.pdf`);
    setIsGeneratingPdf(false);
  };

  if (loadingUser) {
    return <EsqueletoFinanciamiento />;
  }


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
                    <div className='space-y-2'>
                        <Label>1. Selecciona un vehículo</Label>
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
                    </div>

                    {selectedCar && selectedCar.variantes && selectedCar.variantes.length > 1 && (
                        <div className='space-y-2'>
                             <Label>2. Selecciona un color</Label>
                             <Select onValueChange={setSelectedVariantId} value={selectedVariantId}>
                                <SelectTrigger className="w-full h-12 text-base">
                                    <SelectValue placeholder="Selecciona un color" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedCar.variantes.map(variant => (
                                        <SelectItem key={variant.id} value={variant.id}>
                                            {variant.color}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}


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
                     <p className="text-muted-foreground">Tu pago mensual estimado para un {selectedCar?.marca} {selectedCar?.modelo} {selectedVariant?.color ? `color ${selectedVariant.color}` : ''} es:</p>
                    <p className="text-6xl font-bold text-primary tracking-tight mt-2">
                        $ {monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        *Cálculo aproximado con un enganche de ${downPayment.toLocaleString('es-MX')} a {term} meses y una tasa de interés anual fija del {INTEREST_RATE * 100}%.
                    </p>
                    <div className="pt-8 flex justify-center gap-4">
                        <Button variant="outline" onClick={handlePrevStep}>Ajustar Plan</Button>
                        <Button size="lg" onClick={handleSaveFinancing} disabled={isSaving || !user}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Guardar Financiamiento
                        </Button>
                        <Button size="lg" onClick={generatePDF} disabled={isGeneratingPdf}>
                            {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Descargar Cotización
                        </Button>
                    </div>
                </CardContent>
             </Card>
        )}
    </div>
  );
}
