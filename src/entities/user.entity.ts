import { Column, Entity, OneToMany } from 'typeorm';

import { ETableName } from '../common/enums/table-name.enum';
import { EUserRole } from '../common/enums/user-role.enum';
import { EUserStatus } from '../common/enums/user-status.enum';
import { FollowEntity } from './follow.entity';
import { BaseEntity } from './models/base.entity';
import { OrderEntity } from './order.entity';
import { ProductEntity } from './product.entity';
import { RateEntity } from './rate.entity';
import { ReviewEntity } from './review.entity';

@Entity(ETableName.USERS)
export class UserEntity extends BaseEntity {
  @Column()
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ default: 0 })
  filled_profile_step: number;

  @Column({ nullable: true })
  otp_code: string;

  @Column({
    default: EUserStatus.REGISTRATION,
  })
  user_status: EUserStatus;

  @Column({ default: false })
  is_deleted_by_admin: boolean;

  @Column({ nullable: true })
  user_role: EUserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  address_2: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  cloth_size: string;

  @Column({ nullable: true })
  jeans_size: string;

  @Column({ type: 'double', nullable: true })
  shoes_size: number;

  @Column({ nullable: true })
  avgRate: number;

  @Column({ nullable: true })
  stripe_id: string;

  @Column({ nullable: true })
  payment_method_id: string;

  @OneToMany(() => RateEntity, (entity) => entity.rates, { cascade: true })
  rates?: RateEntity[];

  @OneToMany(() => RateEntity, (entity) => entity.user_target, {
    cascade: true,
  })
  rate_targets?: RateEntity[];

  @OneToMany(() => ReviewEntity, (entity) => entity.review_target, {
    cascade: true,
  })
  review_targets?: ReviewEntity[];

  @OneToMany(() => ReviewEntity, (entity) => entity.author, { cascade: true })
  user_reviews?: ReviewEntity[];

  @OneToMany(() => FollowEntity, (entity) => entity.follower, { cascade: true })
  followers?: FollowEntity[];

  @OneToMany(() => FollowEntity, (entity) => entity.following, {
    cascade: true,
  })
  followings?: FollowEntity[];

  @OneToMany(() => OrderEntity, (entity) => entity.buyer, { cascade: true })
  orders?: OrderEntity[];

  @OneToMany(() => ProductEntity, (entity) => entity.owner, { cascade: true })
  products?: ProductEntity[];
}
