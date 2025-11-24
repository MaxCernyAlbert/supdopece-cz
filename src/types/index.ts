// Produkt v nabídce
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // v Kč
  weight: string; // např. "850g"
  image: string;
  category: ProductCategory;
  allergens: number[]; // čísla alergenů (1-14)
  available: boolean;
}

export type ProductCategory = 'chleby' | 'pecivo' | 'sladke' | 'slane';

// Položka v košíku
export interface CartItem {
  product: Product;
  quantity: number;
}

// Časový slot pro vyzvednutí
export interface TimeSlot {
  date: Date;
  time: string; // např. "10:00"
  available: boolean;
}

// Objednávka
export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  pickupDate: string;
  pickupTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  note?: string;
  paymentMethod: 'online' | 'cash' | 'card_on_pickup';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'new' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
}

// Otevírací doba
export interface OpeningHours {
  day: number; // 0 = neděle, 1 = pondělí, ...
  open: string; // "08:00"
  close: string; // "16:00"
  closed: boolean;
}

// Alergeny
export const ALLERGENS: Record<number, string> = {
  1: 'Obiloviny obsahující lepek',
  2: 'Korýši',
  3: 'Vejce',
  4: 'Ryby',
  5: 'Arašídy',
  6: 'Sója',
  7: 'Mléko',
  8: 'Skořápkové plody',
  9: 'Celer',
  10: 'Hořčice',
  11: 'Sezam',
  12: 'Oxid siřičitý a siřičitany',
  13: 'Vlčí bob',
  14: 'Měkkýši',
};
