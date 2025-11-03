import CarCatalog from '@/components/catalog/CarCatalog';
import VirtualAssistant from '@/components/assistant/VirtualAssistant';
import { cars } from '@/lib/data';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Explora Nuestra Colección de Vehículos
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Encuentra el auto que se adapta a tu vida. Nuestra selección curada ofrece calidad, rendimiento y estilo inigualables, listos para que los descubras.
        </p>
      </div>
      <CarCatalog cars={cars} />
      <VirtualAssistant />
    </div>
  );
}
