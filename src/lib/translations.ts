export const traducciones = {
  transmision: {
    'Automatic': 'Automática',
    'Manual': 'Manual',
    'Automática': 'Automática'
  },
  tipoCombustible: {
    'Gasoline': 'Gasolina',
    'Diesel': 'Diésel',
    'Electric': 'Eléctrico',
    'Hybrid': 'Híbrido'
  },
  tipo: {
    'Sedan': 'Sedán',
    'SUV': 'SUV',
    'Sports': 'Deportivo',
    'Truck': 'Camioneta',
    'Hatchback': 'Hatchback'
  },
  color: {
    'Rojo': 'Rojo',
    'Azul': 'Azul',
    'Blanco': 'Blanco',
    'Gris': 'Gris',
    'Negro': 'Negro',
    'Amarillo': 'Amarillo',
    'Plata': 'Plata',
    'Verde': 'Verde'
  }
};

export const colorHexMap: Record<keyof typeof traducciones.color, string> = {
  'Rojo': '#DC2626',
  'Azul': '#3B82F6',
  'Blanco': '#FFFFFF',
  'Gris': '#6B7280',
  'Negro': '#111827',
  'Amarillo': '#F59E0B',
  'Plata': '#D1D5DB',
  'Verde': '#10B981',
};
