import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';

import { EErrorMessage } from 'src/common/enums/error-message.enum';
import { OrderEntity } from 'src/entities/order.entity';

@Injectable()
export class OrderRepository extends Repository<OrderEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderEntity, dataSource.manager);
  }

  private async executeQuery<T>(
    queryBuilder: SelectQueryBuilder<OrderEntity>,
  ): Promise<T> {
    const result = await queryBuilder.getRawOne();
    if (!result) {
      throw new HttpException(
        EErrorMessage.QUERY_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return result;
  }

  private getQueryBuilder(
    userId: string,
    selectField: string,
    aggregate: string,
    extraConditions: string[] = [],
  ): SelectQueryBuilder<OrderEntity> {
    const qb = this.createQueryBuilder('order');

    qb.innerJoin('order.product', 'product')
      .innerJoin('product.owner', 'user')
      .select(`${aggregate}(order.${selectField})`, 'result')
      .where('user.id = :userId', { userId });

    extraConditions.forEach((condition) => qb.andWhere(condition));
    return qb;
  }

  private getPercentage(allTime: number, lastWeek: number): number {
    return Math.floor(allTime ? (lastWeek / allTime - 1) * 100 : 0);
  }

  public async getTotalSalesForUser(
    userId: string,
  ): Promise<{ totalSales: number; lastWeekPercentage: number }> {
    const qbAllTime = this.getQueryBuilder(userId, 'price', 'SUM');

    const resultAllTime = await this.executeQuery<{ result: string }>(
      qbAllTime,
    );

    const totalSalesAllTime = parseInt(resultAllTime.result) || 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 20);

    const qbBeforeLastWeek = this.getQueryBuilder(userId, 'price', 'SUM', [
      'order.created_at <= :oneWeekAgo',
    ]);
    const resultBeforeLastWeek = await this.executeQuery<{ result: string }>(
      qbBeforeLastWeek.setParameters({ oneWeekAgo }),
    );

    const totalSalesBeforeLastWeek = parseInt(resultBeforeLastWeek.result) || 0;

    return {
      totalSales: totalSalesAllTime,
      lastWeekPercentage: this.getPercentage(
        totalSalesBeforeLastWeek,
        totalSalesAllTime,
      ),
    };
  }

  public async getNumberOfOrdersForUser(
    userId: string,
  ): Promise<{ totalOrders: number; lastWeekOrderPercentage: number }> {
    const qbAllTime = this.getQueryBuilder(userId, 'id', 'COUNT');

    const resultAllTime = await this.executeQuery<{ result: string }>(
      qbAllTime,
    );

    const totalOrdersAllTime = parseInt(resultAllTime.result) || 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 20);

    const qbBeforeLastWeek = this.getQueryBuilder(userId, 'id', 'COUNT', [
      'order.created_at <= :oneWeekAgo',
    ]);
    const resultBeforeLastWeek = await this.executeQuery<{ result: string }>(
      qbBeforeLastWeek.setParameters({ oneWeekAgo }),
    );
    const totalOrdersBeforeLastWeek =
      parseInt(resultBeforeLastWeek.result) || 0;

    return {
      totalOrders: totalOrdersAllTime,
      lastWeekOrderPercentage: this.getPercentage(
        totalOrdersBeforeLastWeek,
        totalOrdersAllTime,
      ),
    };
  }

  public async getAverageSalesForUser(
    userId: string,
  ): Promise<{ averageSales: number; lastWeekAveragePercentage: number }> {
    const qbAllTime = this.getQueryBuilder(userId, 'price', 'AVG');

    const resultAllTime = await this.executeQuery<{ result: string }>(
      qbAllTime,
    );

    const averageSalesAllTime = parseInt(resultAllTime.result) || 0;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 20);

    const qbLastWeek = this.getQueryBuilder(userId, 'price', 'AVG', [
      'order.created_at >= :oneWeekAgo',
    ]);
    const resultLastWeek = await this.executeQuery<{ result: string }>(
      qbLastWeek.setParameters({ oneWeekAgo }),
    );

    const averageSalesLastWeek = parseInt(resultLastWeek.result) || 0;

    return {
      averageSales: averageSalesAllTime,
      lastWeekAveragePercentage: this.getPercentage(
        averageSalesAllTime,
        averageSalesLastWeek,
      ),
    };
  }

  public async getTotalSalesPerMonth(
    userId: string,
  ): Promise<{ month: number; total: number }[]> {
    const qb = this.createQueryBuilder('order');
    qb.innerJoin('order.product', 'product')
      .innerJoin('product.owner', 'user')
      .select('DATE_FORMAT(order.created_at, "%m")', 'month')
      .addSelect('SUM(order.price)', 'total')
      .where('user.id = :userId', { userId })
      .andWhere('order.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)')
      .groupBy('month')
      .orderBy('month', 'ASC');

    const result = await qb.getRawMany();
    if (!result) {
      throw new HttpException(
        EErrorMessage.QUERY_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.map((row) => ({
      month: parseInt(row.month),
      total: parseInt(row.total),
    }));
  }

  public async getTotalSalesForTopCategoriesForUser(
    userId: string,
  ): Promise<{ category: string; totalSales: number; orderCount: number }[]> {
    const someDaysAgo = new Date();
    someDaysAgo.setDate(someDaysAgo.getDate() - 20);

    const qb = this.createQueryBuilder('order');
    qb.innerJoin('order.product', 'product')
      .innerJoin('product.owner', 'user')
      .select('product.category', 'category')
      .addSelect('SUM(order.price)', 'totalSales')
      .addSelect('COUNT(order.id)', 'orderCount')
      .where('user.id = :userId', { userId })
      .andWhere('order.created_at >= :someDaysAgo', { someDaysAgo })

      .groupBy('product.category')
      .orderBy('totalSales', 'DESC')
      .limit(4);

    const result = await qb.getRawMany();
    if (!result) {
      throw new HttpException(
        EErrorMessage.QUERY_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result.map((row) => ({
      category: row.category,
      totalSales: parseInt(row.totalSales),
      orderCount: parseInt(row.orderCount, 10),
    }));
  }

  public async getOrdersForLastThreeDays(
    userId: string,
  ): Promise<OrderEntity[]> {
    const someDaysAgo = new Date();
    someDaysAgo.setDate(someDaysAgo.getDate() - 20);

    const qb = this.createQueryBuilder('order');
    qb.innerJoin('order.product', 'product')
      .innerJoin('product.owner', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('order.created_at >= :someDaysAgo', { someDaysAgo })
      .select([
        'order.id',
        'order.price',
        'product.id',
        'product.product_name',
      ]);

    const result = await qb.getRawMany();

    if (!result) {
      throw new HttpException(
        EErrorMessage.QUERY_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return result;
  }
}
