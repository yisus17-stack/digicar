import FinancingSimulatorPage from "@/components/financing/FinancingSimulatorPage";
import { cars } from "@/lib/data";

export default function FinancingPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Simulador de Pagos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Calcula y visualiza las opciones de financiamiento para el auto de tus sueños.
        </p>
      </div>
      <FinancingSimulatorPage cars={cars} />
    </div>
  );
}
