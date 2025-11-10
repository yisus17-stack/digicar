import ComparisonPage from "@/components/comparison/ComparisonPage";
import { cars } from "@/lib/data";
import { Car } from "@/lib/types";
import { GitCompareArrows } from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDictionary } from "@/lib/get-dictionary";
import { Locale } from "@/i18n-config";

export default async function Compare({ 
  searchParams,
  params: { locale }
}: { 
  searchParams: { ids?: string },
  params: { locale: Locale } 
}) {
  const dictionary = await getDictionary(locale);
  const ids = searchParams.ids?.split(',').filter(Boolean) || [];
  const carsToCompare = cars.filter(car => ids.includes(car.id)).slice(0, 2);

  if (carsToCompare.length < 1) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 text-center">
        <GitCompareArrows className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{dictionary.compare.select_to_compare_title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{dictionary.compare.select_to_compare_description}</p>
        <Button asChild className="mt-6">
          <Link href="/catalog">{dictionary.compare.go_to_catalog}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                {dictionary.compare.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                {dictionary.compare.subtitle}
            </p>
        </div>
        <ComparisonPage 
          cars={carsToCompare as [Car] | [Car, Car]} 
          allCars={cars}
          dictionary={dictionary.compare}
        />
    </div>
  );
}
