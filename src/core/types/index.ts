export type Car = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  tipoCombustible: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmision: string;
  motor?: string;
  caracteristicas: string[];
  imagenUrl: string;
  tipo: 'Sedan' | 'SUV' | 'Sports' | 'Truck' | 'Hatchback';
  cilindrosMotor: number;
  color: string;
  pasajeros: number;
};

export type Marca = {
    id: string;
    nombre:string;
    logoUrl?: string;
}

export type Color = {
    id: string;
    nombre: string;
}

export type Transmision = {
  id: string;
  nombre: string;
}
