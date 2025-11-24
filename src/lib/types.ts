export type Auto = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: string;
  engine: string;
  horsepower: number;
  features: string[];
  imageUrl: string;
  type: 'Sedan' | 'SUV' | 'Sports' | 'Truck' | 'Hatchback';
  engineCylinders: number;
  color: string;
  passengers: number;
};

export type Marca = {
    id: string;
    name: string;
    logoUrl?: string;
}

export type Color = {
    id: string;
    name: string;
}

export type TipoCombustible = {
  id: string;
  name: string;
}

export type Transmision = {
  id: string;
  name: string;
}
