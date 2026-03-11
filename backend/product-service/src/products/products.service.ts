import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './interfaces/product.interface';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private idCounter = 1;

  create(createProductDto: CreateProductDto): Product {
    const now = new Date().toISOString();
    const newProduct: Product = {
      id: this.idCounter++,
      ...createProductDto,
      createdAt: now,
      updatedAt: now,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((item) => item.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto): Product {
    const product = this.findOne(id);
    Object.assign(product, updateProductDto, { updatedAt: new Date().toISOString() });
    return product;
  }

  remove(id: number): { message: string } {
    this.findOne(id);
    this.products = this.products.filter((item) => item.id !== id);
    return { message: `Product with id ${id} deleted successfully` };
  }

  reduceStock(id: number, quantity: number): Product {
    const product = this.findOne(id);
    product.stock = Math.max(0, product.stock - quantity);
    product.updatedAt = new Date().toISOString();
    return product;
  }
}
