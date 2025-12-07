
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

const INTEREST_RATE = 0.12; // Tasa de interés anual fija del 12%

interface FinancingCalculatorProps {
  allCars: Car[];
}

export default function FinancingCalculator({ allCars }: FinancingCalculatorProps) {
  const [step, setStep] = useState(1);
  const [monthlyBudget, setMonthlyBudget] = useState(5000);
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const [downPayment, setDownPayment] = useState(200000);
  const [term, setTerm] = useState(24);

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

  const suggestedCars = useMemo(() => {
    if (step !== 2) return [];

    return allCars.filter(car => {
        const price = car.variantes?.[0]?.precio ?? car.precio ?? 0;
        if (price <= 0) return false;

        // Estimate payment with 20% down payment and 60 months term
        const estimatedDownPayment = price * 0.20;
        const amountToFinance = price - estimatedDownPayment;
        const monthlyRate = INTEREST_RATE / 12;
        const estimatedTerm = 60;
        
        const estimatedPayment = (amountToFinance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -estimatedTerm));

        return estimatedPayment <= monthlyBudget;
    });
  }, [allCars, monthlyBudget, step]);


  const handleCarChange = (id: string) => {
    setSelectedCarId(id);
    const car = allCars.find(c => c.id === id);
    const price = car?.variantes?.[0]?.precio ?? car?.precio ?? 0;
    setDownPayment(price * 0.2);
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const carImage = selectedCar?.variantes?.[0]?.imagenUrl ?? selectedCar?.imagenUrl;

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
                            max={30000}
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
                                            <span>{car.marca} {car.modelo}</span>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <Card className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="aspect-[16/10] bg-white dark:bg-background rounded-lg flex items-center justify-center">
                                {carImage && (
                                    <Image
                                        src={carImage}
                                        alt={selectedCar?.modelo ?? 'Auto seleccionado'}
                                        width={600}
                                        height={400}
                                        className="object-contain h-full w-full"
                                    />
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
                        <Button size="lg">Solicitar Crédito</Button>
                    </div>
                </CardContent>
             </Card>
        )}
    </div>
  );
}

    