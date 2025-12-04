import { Timestamp } from "firebase/firestore";

export type Car = {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio: number;
  tipoCombustible: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmision: string;
  caracteristicas: string[];
  imagenUrl: string;
  tipo: 'Sedan' | 'SUV' | 'Sports' | 'Truck' | 'Hatchback';
  cilindrosMotor: number;
  color: string;
  pasajeros: number;
  createdAt?: Date;
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
