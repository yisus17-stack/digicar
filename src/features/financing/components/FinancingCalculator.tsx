'use client';

import { useState, useMemo } from 'react';
import type { Car } from '@/core/types';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Car as CarIcon } from 'lucide-react';

const INTEREST_RATE = 0.12; // Tasa de interés anual fija del 12%

interface FinancingCalculatorProps {
  allCars: Car[];
}

export default function FinancingCalculator({ allCars }: FinancingCalculatorProps) {
  const [selectedCarId, setSelectedCarId] = useState<string | undefined>(undefined);
  const [downPayment, setDownPayment] = useState(200000);
  const [term, setTerm] = useState(24);

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
    
    const payment =
      (amountToFinance * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -term));

    return payment;
  }, [carPrice, downPayment, term]);

  const handleCarChange = (id: string) => {
    setSelectedCarId(id);
    const car = allCars.find(c => c.id === id);
    const price = car?.variantes?.[0]?.precio ?? car?.precio ?? 0;
    setDownPayment(price * 0.2); // Establecer un enganche inicial del 20%
  };

  const carImage = selectedCar?.variantes?.[0]?.imagenUrl ?? selectedCar?.imagenUrl;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
      {/* Columna Izquierda: Imagen del Auto y Selector */}
      <div className="lg:col-span-2 space-y-6 sticky top-24">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="aspect-[16/10] bg-muted rounded-lg flex items-center justify-center">
              {carImage ? (
                <Image
                  src={carImage}
                  alt={selectedCar?.modelo ?? 'Auto seleccionado'}
                  width={600}
                  height={400}
                  className="object-contain h-full w-full"
                />
              ) : (
                <CarIcon className="h-24 w-24 text-muted-foreground" />
              )}
            </div>
          </CardContent>
        </Card>
        <Select onValueChange={handleCarChange} value={selectedCarId}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue placeholder="Selecciona un auto para comenzar" />
          </SelectTrigger>
          <SelectContent>
            {allCars.map(car => (
              <SelectItem key={car.id} value={car.id}>
                {car.marca} {car.modelo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Columna Derecha: Calculadora */}
      <div className="lg:col-span-3">
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Precio del Auto */}
            <div>
              <Label htmlFor="car-price" className="text-muted-foreground">Precio del vehículo</Label>
              <Input
                id="car-price"
                readOnly
                value={`$ ${carPrice.toLocaleString('es-MX')}`}
                className="text-2xl font-bold h-12 mt-2 bg-transparent border-0 px-0"
              />
            </div>

            {/* Slider de Enganche */}
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
            
            {/* Slider de Plazo */}
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

            {/* Resultado */}
            <div className="border-t pt-8 text-center">
              <p className="text-muted-foreground">Tu pago mensual estimado es:</p>
              <p className="text-5xl font-bold text-primary tracking-tight mt-2">
                $ {monthlyPayment.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                *Cálculo aproximado. Tasa de interés anual fija del {INTEREST_RATE * 100}%.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
