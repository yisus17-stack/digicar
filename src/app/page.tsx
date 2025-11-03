import CarCatalog from '@/components/catalog/CarCatalog';
import VirtualAssistant from '@/components/assistant/VirtualAssistant';
import { cars } from '@/lib/data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Explore Our Vehicle Collection
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Find the car that fits your life. Our curated selection offers unparalleled quality, performance, and style, ready for you to discover.
        </p>
      </div>
      <CarCatalog cars={cars} />
      <VirtualAssistant />
    </div>
  );
}
