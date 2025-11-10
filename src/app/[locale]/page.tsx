import CarCatalog from '@/components/catalog/CarCatalog';
import { cars } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

const BrandLogos = () => (
    <div className="bg-muted">
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                <Image src="/audi-logo.svg" alt="Audi" width={100} height={40} className="filter brightness-0" />
                <Image src="/vw-logo.svg" alt="Volkswagen" width={60} height={60} className="filter brightness-0"/>
                <Image src="/logo.png" alt="DigiCar" width={150} height={50} />
                <Image src="/kia-logo.svg" alt="Kia" width={80} height={40} className="filter brightness-0"/>
            </div>
        </div>
    </div>
);


export default async function Home({ params: { locale } }: { params: { locale: Locale }}) {
    const popularCars = cars.slice(0, 3);
    const dictionary = await getDictionary(locale);

    return (
        <>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                            <span className="whitespace-nowrap">{dictionary.home.headline_1}</span> <span className="text-primary">DigiCar</span>
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0">
                            {dictionary.home.subheadline}
                        </p>
                        <div className="mt-8 flex flex-row gap-4 justify-center md:justify-start">
                            <Button size="lg">
                                {dictionary.home.explore_button}
                            </Button>
                            <Button asChild size="lg" variant="outline">
                                <Link href={`/${locale}/catalog`}>{dictionary.home.view_catalog_button}</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="mt-8 md:mt-0">
                        <Image
                            src="/auto-inicio.png"
                            alt="Coche principal"
                            width={800}
                            height={600}
                            className="w-full h-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
            
            <BrandLogos />

            <div id="popular" className="container mx-auto px-4 py-16">
                <div className="text-center md:text-left mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {dictionary.home.popular_cars_title}
                    </h2>
                </div>
                <CarCatalog cars={popularCars} dictionary={dictionary} />
            </div>
            
            <div className="text-center mb-16 px-4">
              <Button asChild variant="outline">
                <Link href={`/${locale}/catalog`}>
                  {dictionary.home.view_all_vehicles_button} <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
        </>
    );
}
