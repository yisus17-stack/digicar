export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: 'Gasoline' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Automatic' | 'Manual';
  engine: string;
  horsepower: number;
  features: string[];
  image: string;
  type: 'Sedan' | 'SUV' | 'Sports' | 'Truck' | 'Hatchback';
  engineCylinders: number;
  color: string;
  passengers: number;
};
