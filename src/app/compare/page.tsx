import ComparisonPage from "@/components/comparison/ComparisonPage";
import { cars } from "@/lib/data";
import { Car } from "@/lib/types";
import { GitCompareArrows } from "lucide-react";

export default function Compare({ searchParams }: { searchParams: { ids?: string } }) {
  const ids = searchParams.ids?.split(',') || [];
  const carsToCompare = cars.filter(car => ids.includes(car.id)).slice(0, 2);

  if (carsToCompare.length < 2) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <GitCompareArrows className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Select Cars to Compare</h1>
        <p className="mt-2 text-lg text-muted-foreground">Please select two cars from the catalog to see a side-by-side comparison.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                Model Comparison
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Here's how your selected vehicles stack up. Let our AI help you decide.
            </p>
        </div>
        <ComparisonPage cars={carsToCompare as [Car, Car]} />
    </div>
  );
}
