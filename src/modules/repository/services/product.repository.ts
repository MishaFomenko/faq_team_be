import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';

import { ESort } from 'src/common/enums/sort.enum';
import { ProductEntity } from 'src/entities/product.entity';
import { ProductsFilterDto } from 'src/modules/product/dto/filter-products.request.dto';
import { ProductsFilterResponseDto } from 'src/modules/product/dto/filter-products.response.dto';

@Injectable()
export class ProductRepository extends Repository<ProductEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(ProductEntity, dataSource.manager);
  }

  public async getAllProducts(
    dto: ProductsFilterDto,
  ): Promise<ProductsFilterResponseDto> {
    const {
      page = 1,
      limit,
      search,
      size,
      style,
      color,
      min,
      max,
      order = ESort.ASC,
    } = dto;
    const queryBuilder = this.createQueryBuilder('product');

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('product.product_name LIKE :search', {
            search: `%${search}%`,
          }).orWhere('product.description LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (size) {
      queryBuilder.andWhere('product.size = :size', { size });
    }

    if (style) {
      queryBuilder.andWhere('product.style = :style', { style });
    }

    if (color) {
      queryBuilder.andWhere('product.color = :color', { color });
    }

    if (min) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: min,
      });
    }
    if (max) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: max,
      });
    }
    queryBuilder
      .leftJoin('product.owner', 'owner', 'product.vendor_id = owner.id')
      .addSelect(['owner.full_name', 'owner.id']);

    queryBuilder
      .orderBy('product.price', order)
      .skip(limit ? (page - 1) * limit : 0)
      .take(limit);

    const [products, totalCount] = await queryBuilder.getManyAndCount();

    return { totalCount, products };
  }
}
