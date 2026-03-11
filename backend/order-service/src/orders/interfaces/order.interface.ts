export interface OrderProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Order {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  product: OrderProduct;
}
