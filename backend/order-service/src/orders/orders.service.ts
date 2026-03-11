import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './interfaces/order.interface';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private idCounter = 1;

  private readonly PRODUCT_SERVICE_URL = 'http://localhost:3001';

  constructor(private readonly httpService: HttpService) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const { productId, quantity } = createOrderDto;

    // Step 1: Fetch product from product-service
    let product;
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.PRODUCT_SERVICE_URL}/products/${productId}`),
      );
      product = response.data;
    } catch {
      throw new NotFoundException(
        `Product with id ${productId} not found in product service`,
      );
    }

    // Step 2: Validate stock
    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
      );
    }

    // Step 3: Create the order
    const now = new Date().toISOString();
    const newOrder: Order = {
      id: this.idCounter++,
      productId,
      quantity,
      totalPrice: parseFloat((product.price * quantity).toFixed(2)),
      status: 'CONFIRMED',
      createdAt: now,
      updatedAt: now,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        stock: product.stock,
      },
    };

    this.orders.push(newOrder);

    // Step 4: Reduce stock in product-service (fire-and-forget, non-blocking)
    this.httpService
      .patch(`${this.PRODUCT_SERVICE_URL}/products/${productId}/reduce-stock`, {
        quantity,
      })
      .subscribe({
        error: (err) =>
          console.warn(`Stock reduction failed for product ${productId}:`, err?.message),
      });

    return newOrder;
  }

  findAll(): Order[] {
    return this.orders;
  }

  findOne(id: number): Order {
    const order = this.orders.find((item) => item.id === id);
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  cancel(id: number): Order {
    const order = this.findOne(id);
    if (order.status === 'CANCELLED') {
      throw new BadRequestException(`Order with id ${id} is already cancelled`);
    }
    order.status = 'CANCELLED';
    order.updatedAt = new Date().toISOString();
    return order;
  }
}
