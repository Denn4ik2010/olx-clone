import {
  Controller,
  Post,
  Delete,
  Get,
  UseGuards,
  UseInterceptors,
  Param,
  Req,
  HttpCode,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthRequest } from '../types/request.type';
import { VerifiedUserGuard } from '../auth/guards/verified-user.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { RequieredRoles } from '../auth/decorator/requiered-roles.decorator';
import { Role } from '../enum/role.enum';
import { CartProduct } from './types/cart.type';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('api/cart')
@UseGuards(VerifiedUserGuard)
export class CartApiController {
  constructor(private readonly cartService: CartService) {}

  @Get(':cartId')
  @RequieredRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseInterceptors(CacheInterceptor)
  async getCart(@Param('cartId') cartId: number): Promise<CartProduct> {
    return await this.cartService.getCart(cartId);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyCart(@Req() req: AuthRequest): Promise<CartProduct> {
    return await this.cartService.getMyCart(req.user.id);
  }

  @Post('products/:productId')
  @HttpCode(200)
  async addToCart(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.addToCart(productId, req.user.id);
  }

  @Delete('products/:productId')
  async removeFromCart(
    @Req() req: AuthRequest,
    @Param('productId') productId: number,
  ): Promise<CartProduct> {
    return await this.cartService.removeFromCart(productId, req.user.id);
  }

  @Delete('products')
  async clearCart(@Req() req: AuthRequest): Promise<CartProduct> {
    return await this.cartService.clearCart(req.user.id);
  }
}
