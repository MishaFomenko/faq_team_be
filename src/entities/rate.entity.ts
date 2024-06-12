import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { ETableName } from '../common/enums/table-name.enum';
import { DEFAULT_USER_RATE } from '../utils/generalConstants';
import { BaseEntity } from './models/base.entity';
import { UserEntity } from './user.entity';

@Entity(ETableName.RATES)
export class RateEntity extends BaseEntity {
  @Column({ default: DEFAULT_USER_RATE })
  rate: number;

  @Column()
  rater: string;
  @ManyToOne(() => UserEntity, (entity) => entity.rates)
  @JoinColumn({ name: 'rater' })
  rates?: UserEntity;

  @Column()
  rate_target_id: string;
  @ManyToOne(() => UserEntity, (entity) => entity.rate_targets)
  @JoinColumn({ name: 'rate_target_id' })
  rate_targets?: UserEntity;
}
