import CarTable from "@/components/admin/CarTable";
import { cars } from "@/lib/data";

export default function AdminCarsPage() {
    // Por ahora, usamos los datos locales. Esto se reemplazará con datos de Firestore.
    const allCars = cars;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <CarTable cars={allCars} />
        </div>
    );
}
