import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, Repository } from 'typeorm';

import { ESort } from 'src/common/enums/sort.enum';
import { EUserRole } from 'src/common/enums/user-role.enum';
import { UserEntity } from 'src/entities/user.entity';
import { UsersFilterDto } from 'src/modules/user/dto/filter-users.request.dto';
import { UsersFilterResponseDto } from 'src/modules/user/dto/filter-users.response.dto';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(UserEntity, dataSource.manager);
  }

  public async getFullInfo(id: string) {
    const qb = this.createQueryBuilder('user');
    qb.leftJoinAndSelect(
      'user.user_reviews',
      'user_reviews',
      'user.id = user_reviews.author',
    );

    qb.leftJoinAndSelect(
      'user.products',
      'products',
      'user.id = products.vendor_id',
    );

    qb.leftJoin(
      'user_reviews.review_target',
      'review_target',
      'user_reviews.review_target_id = review_target.id',
    ).addSelect(['review_target.id', 'review_target.full_name']);

    qb.leftJoinAndSelect(
      'user.review_targets',
      'review_targets',
      'user.id = review_targets.review_target',
    );

    qb.leftJoin(
      'review_targets.author',
      'author',
      'review_targets.reviewer_id = review_target.id',
    );

    qb.leftJoin(
      'user.rate_targets',
      'rate_targets',
      'user.id = rate_targets.user_target',
    ).addSelect(['rate_targets.rate']);

    qb.where('user.id = :id', { id });

    return await qb.getOne();
  }

  public async getAllUsers(
    dto: UsersFilterDto,
  ): Promise<UsersFilterResponseDto> {
    const { page = 1, limit, order = ESort.ASC, search = '', role } = dto;

    const queryBuilder = this.createQueryBuilder('user')
      .where('user.is_deleted_by_admin = :isDeleted', { isDeleted: false })
      .andWhere('user.user_role != :superAdminRole', {
        superAdminRole: EUserRole.SUPERADMIN,
      });

    if (role) {
      if (role === EUserRole.VENDOR) {
        queryBuilder
          .leftJoinAndSelect(
            'user.products',
            'products',
            'user.id = products.vendor_id',
          )
          .orderBy('avgRate', order);
      }
      queryBuilder.andWhere('user.user_role = :role', { role });
    }

    if (search) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('user.full_name LIKE :search', {
            search: `%${search}%`,
          }).orWhere('user.email LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    queryBuilder
      .orderBy('user.full_name', order)
      .skip(limit ? (page - 1) * limit : 0)
      .take(limit);

    const [users, totalCount] = await queryBuilder.getManyAndCount();

    users.forEach((user) => {
      if (user.products.length > 10) {
        user.products = user.products.slice(0, 10);
      }
    });

    return { totalCount, users };
  }
}
