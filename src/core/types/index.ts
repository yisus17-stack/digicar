
import { Timestamp } from "firebase/firestore";

export type CarVariant = {
  id: string;
  color: 'Rojo' | 'Azul' | 'Blanco' | 'Gris' | 'Negro' | 'Amarillo' | 'Plata' | 'Verde';
  imagenUrl: string;
  precio: number;
};

export type Car = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  tipoCombustible: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmision: 'Automática' | 'Manual';
  caracteristicas: string[];
  tipo: 'Sedan' | 'SUV' | 'Sports' | 'Truck' | 'Hatchback';
  cilindrosMotor: number;
  pasajeros: number;
  variantes: CarVariant[];
  createdAt?: Date;
  // Deprecated properties, kept for potential data migration
  precio?: number;
  imagenUrl?: string;
  color?: string;
};

export type Marca = {
    id: string;
    nombre:string;
    logoUrl?: string;
    createdAt?: Date;
}

export type Color = {
    id: string;
    nombre: string;
    createdAt?: Date;
}

export type Transmision = {
  id: string;
  nombre: string;
  createdAt?: Date;
}

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
}
