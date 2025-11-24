'use client';

import { Auto } from '@/lib/types';
import TarjetaAuto from './TarjetaAuto';
import TarjetaAutoMovil from './TarjetaAutoMovil';

interface CatalogoAutosProps {
  autos: Auto[];
  idsComparacion?: string[];
  alAlternarComparacion?: (autoId: string) => void;
}

export default function CatalogoAutos({ autos, idsComparacion = [], alAlternarComparacion = () => {} }: CatalogoAutosProps) {
  return (
    <>
      {/* Vista Móvil */}
      <div className="md:hidden border rounded-lg overflow-hidden">
        {autos.map(auto => (
          <TarjetaAutoMovil 
            key={`mobile-${auto.id}`} 
            auto={auto}
            estaSeleccionado={idsComparacion.includes(auto.id)}
            alAlternarComparacion={alAlternarComparacion}
          />
        ))}
      </div>

      {/* Vista de Escritorio */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {autos.map(auto => (
          <TarjetaAuto 
            key={`desktop-${auto.id}`} 
            auto={auto}
            estaSeleccionado={idsComparacion.includes(auto.id)}
            alAlternarComparacion={alAlternarComparacion}
          />
        ))}
      </div>
    </>
  );
}
