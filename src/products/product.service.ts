import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductRepository } from './product.repository';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesService } from '../files/files.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ProductFilter } from './interface/product-filter.interface';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly fileService: FilesService,
  ) {}

  private async validateProductOwnership(
    userId: number,
    productId: number,
  ): Promise<Product> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException();
    }
    return product;
  }

  async findAll(filter: ProductFilter): Promise<Product[]> {
    const { maxPrice, minPrice, title } = filter;
    const productFilter: ProductFilter = {};

    if (title) {
      productFilter.title = title;
    }
    if (minPrice) {
      productFilter.minPrice = minPrice;
    }
    if (maxPrice) {
      productFilter.maxPrice = maxPrice;
    }

    return await this.productRepository.findAll(productFilter);
  }

  async findById(productId: number): Promise<Product> {
    const product = await this.productRepository.findById(productId);

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async findUserProducts(userId: number): Promise<Product[]> {
    const userProducts = await this.productRepository.findUserProducts(userId);

    if (!userProducts) throw new NotFoundException('Products not found');

    return userProducts;
  }

  async create(
    userId: number,
    dto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<Product> {
    try {
      const imagesNames = await this.fileService.createImages(images);

      return await this.productRepository.create(userId, dto, imagesNames);
    } catch (e) {
      console.log(e);
      if (e instanceof PrismaClientKnownRequestError) {
        console.log(e);
        throw new BadRequestException(
          'Product with same name created.Please change the name!',
        );
      }
    }
  }

  async updateProduct(
    userId: number,
    productId: number,
    dto: UpdateProductDto,
    images?: Express.Multer.File[],
  ): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    let imagesNames: string[] = [];
    if (images && images.length > 0) {
      imagesNames = await this.fileService.createImages(images);
    } else {
      imagesNames = [];
    }

    return await this.productRepository.update(productId, dto, imagesNames);
  }

  async deleteProduct(userId: number, productId: number): Promise<Product> {
    await this.validateProductOwnership(userId, productId);

    return await this.productRepository.delete(productId);
  }
}
