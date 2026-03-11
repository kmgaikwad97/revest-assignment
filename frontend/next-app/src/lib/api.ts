const PRODUCT_API = 'http://localhost:3001';
const ORDER_API = 'http://localhost:3002';

// Types
export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  product: Omit<Product, 'createdAt' | 'updatedAt'>;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  description: string;
  stock: number;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface CreateOrderPayload {
  productId: number;
  quantity: number;
}

// products

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${PRODUCT_API}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const res = await fetch(`${PRODUCT_API}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<Product> {
  const res = await fetch(`${PRODUCT_API}/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`${PRODUCT_API}/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete product');
}

// orders
export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${ORDER_API}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await fetch(`${ORDER_API}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? 'Failed to create order');
  }
  return res.json();
}

export async function cancelOrder(id: number): Promise<Order> {
  const res = await fetch(`${ORDER_API}/orders/${id}/cancel`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to cancel order');
  return res.json();
}
