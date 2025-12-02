import PaginaSimulador from "@/components/simulator/SimulatorPage";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export default function Simulador() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <Breadcrumbs items={[{ label: 'Simulador IA' }]} />
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                    Simulador de Recomendación de Autos
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Dinos tus necesidades y nuestra IA encontrará el auto perfecto para ti de nuestra colección exclusiva.
                </p>
            </div>
            <PaginaSimulador />
        </div>
    );
}
