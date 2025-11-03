import SimulatorPage from "@/components/simulator/SimulatorPage";

export default function Simulator() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                    Car Recommendation Simulator
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Tell us your needs, and our AI will find the perfect car for you from our exclusive collection.
                </p>
            </div>
            <SimulatorPage />
        </div>
    );
}
