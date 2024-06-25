import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@stripe/stripe-js';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';

import { EAwsBucketPath } from 'src/common/enums/aws-bucket-path.enum';
import { EErrorMessage } from 'src/common/enums/error-message.enum';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from 'src/modules/repository/services/user.repository';
import { UsersFilterDto } from 'src/modules/user/dto/filter-users.request.dto';
import { UsersFilterResponseDto } from 'src/modules/user/dto/filter-users.response.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { S3Service } from 'src/modules/user/services/s3.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  public async getFullInfo(id: string): Promise<UserEntity> {
    let sumRate = 0;

    await this.isUserExist(id);

    const user = await this.userRepository.getFullInfo(id);

    user.rate_targets.map((entity) => (sumRate = sumRate + entity.rate));

    user.avgRate = sumRate / user.rate_targets.length;

    return user;
  }

  public async isUserExist(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new HttpException(
        EErrorMessage.USER_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    return user;
  }

  public async isEmailUnique(email: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ email });

    if (user) {
      throw new HttpException(
        EErrorMessage.EMAIL_ALREADY_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async updateUser(
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<void> {
    const { password, ...dtoWithoutPassword } = updateUserDto;
    const user = await this.isUserExist(id);

    if (!user) {
      throw new HttpException(
        EErrorMessage.USER_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (password) {
      const salt = +this.configService.get('SALT');
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      user.password = hashedPassword;
    }

    await this.userRepository.update(id, {
      password: user.password,
      ...dtoWithoutPassword,
    });
  }

  public async saveCardInfo({
    id,
    paymentMethod,
  }: {
    id: string;
    paymentMethod: PaymentMethod;
  }): Promise<void> {
    const step = 4;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(
        EErrorMessage.USER_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }
    const stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET'));

    const customer = await stripe.customers.create({
      payment_method: paymentMethod.id,
      email: paymentMethod.billing_details.email,
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    if (user.filled_profile_step < step) {
      user.filled_profile_step = step;
    }

    user.stripe_id = customer.id;
    user.payment_method_id = paymentMethod.id;

    await this.userRepository.save(user);
  }

  public async saveGeneralInfo({
    id,
    file,
    phone,
  }: {
    id: string;
    file: Express.Multer.File;
    phone: string;
  }): Promise<void> {
    const itemType = EAwsBucketPath.ITEM_TYPE_AVATAR;
    const name = EAwsBucketPath.NAME_USER;
    const step = 2;

    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(
        EErrorMessage.USER_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.filled_profile_step < step) {
      user.filled_profile_step = step;
    }

    const imageUrl = await this.s3Service.uploadFile(file, itemType, name);

    user.avatar = imageUrl;
    user.phone = phone;

    await this.userRepository.save(user);
  }

  public async getAllUsers(
    dto: UsersFilterDto,
  ): Promise<UsersFilterResponseDto> {
    return await this.userRepository.getAllUsers(dto);
  }

  public async softDelete(id: string): Promise<void> {
    const user = await this.isUserExist(id);
    user.is_deleted_by_admin = true;
    await this.userRepository.save(user);
  }

  public async deleteMe(id: string): Promise<void> {
    await this.isUserExist(id);
    await this.userRepository.delete(id);
  }
}
