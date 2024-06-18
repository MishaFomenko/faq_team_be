import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod } from '@stripe/stripe-js';
import * as bcrypt from 'bcrypt';
import { EErrorMessage } from 'src/common/enums/error-message.enum';
import { UserEntity } from 'src/entities/user.entity';
import { UserRepository } from 'src/modules/repository/services/user.repository';
import { GeneralInfoDto } from 'src/modules/user/dto/general-info.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import Stripe from 'stripe';

import { S3Service } from './aws.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly s3Service: S3Service,
  ) {}

  public async getFullInfo(id: string): Promise<UserEntity> {
    await this.isUserExist(id);
    return await this.userRepository.getFullInfo(id);
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
    step,
    cardDto,
  }: {
    id: string;
    step: number;
    cardDto: PaymentMethod;
  }): Promise<void> {
    const stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET'));

    const customer = await stripe.customers.create({
      payment_method: cardDto.id,
      email: cardDto.billing_details.email,
      invoice_settings: {
        default_payment_method: cardDto.id,
      },
    });

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

    user.stripe_id = customer.id;
    user.payment_method_id = cardDto.id;

    await this.userRepository.save(user);
  }

  public async saveGeneralInfo({
    generalInfoDto,
    id,
  }: {
    id: string;
    generalInfoDto: GeneralInfoDto;
  }): Promise<void> {
    const itemType = 'avatar';
    const name = 'user';
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new HttpException(
        EErrorMessage.USER_NOT_EXIST,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.filled_profile_step < generalInfoDto.step) {
      user.filled_profile_step = generalInfoDto.step;
    }

    const imageUrl = await this.s3Service.uploadFile(
      generalInfoDto.image,
      itemType,
      name,
    );

    user.avatar = imageUrl;
    user.phone = generalInfoDto.phone;
    await this.userRepository.save(user);
  }
}
