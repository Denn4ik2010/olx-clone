import {
  BadRequestException,
  NotFoundException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { CartProduct } from './types/cart.type';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { CartErrorMessages as CartErrMsg } from './enum/cart-error-messages.enum';
import { ProductErrorMessages as ProductErrMsg } from '../product/enum/product-error-messages.enum';

@Injectable()
export class CartService {
  private readonly logger: Logger = new Logger(CartService.name);

  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(cartId: number): Promise<CartProduct> {
    const cart = await this.cartRepository.findCartById(cartId);

    if (!cart) {
      this.logger.warn(`Cart ${cartId} not founded`);
      throw new NotFoundException(CartErrMsg.CartNotFound);
    }

    this.logger.log(`Cart ${cartId} fecthed succesfully`);
    return cart;
  }

  async getMyCart(userId: number): Promise<CartProduct> {
    const cart = await this.cartRepository.findMyCart(userId);

    this.logger.log(`Cart fetched succesfully for user ${userId}`);
    return cart;
  }

  async addToCart(productId: number, userId: number): Promise<CartProduct> {
    try {
      const cart = await this.cartRepository.addToCart(productId, userId);

      this.logger.log(`Product ${productId} added to cart user ${userId}`);

      return cart;
    } catch (e: unknown) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(ProductErrMsg.ProductNotFound);
      }
    }
  }

  async removeFromCart(
    productId: number,
    userId: number,
  ): Promise<CartProduct> {
    const cart = await this.cartRepository.removeFromCart(productId, userId);

    this.logger.log(`Product ${productId} removed from cart user ${userId}`);

    return cart;
  }

  async clearCart(userId: number): Promise<CartProduct> {
    this.logger.log(`Clearing cart for user ${userId}`);
    return await this.cartRepository.clearCart(userId);
  }
}
