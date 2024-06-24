import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as randomize from 'randomatic';

import { UserEntity } from 'src/entities/user.entity';
import { AccesResponseDto } from 'src/modules/auth/dto/sign-in.response.dto';
import { SignUpRequestDto } from 'src/modules/auth/dto/sign-up.request.dto';
import { UserDto } from 'src/modules/auth/dto/user.response.dto';
import { EMailTemplate } from 'src/modules/mail/enums/mail-template.enum';
import { ESubjectName } from 'src/modules/mail/enums/subject-name.enum';
import { MailService } from 'src/modules/mail/mail.service';
import { UserRepository } from 'src/modules/repository/services/user.repository';
import { UserService } from 'src/modules/user/services/user.service';
import {
  AuthServiceErrors,
  UsersServiceErrors,
} from 'src/utils/constants/errorTexts';
import { otpGeneratorParams } from 'src/utils/generalConstants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  public async signUp(dto: SignUpRequestDto): Promise<UserEntity> {
    await this.userService.isEmailUnique(dto.email);

    const salt = +this.configService.get<string>('SALT');
    const hashedPassword = await bcrypt.hash(dto.password, salt);
    const otp: string = randomize(
      otpGeneratorParams.pattern,
      otpGeneratorParams.length,
    );

    await Promise.all([
      await this.userRepository.save(
        this.userRepository.create({
          ...dto,
          password: hashedPassword,
          otp_code: otp,
        }),
      ),
      await this.mailService.sendMail(
        dto.email,
        ESubjectName.VERIFY,
        EMailTemplate.VERIFY,
        { otp_code: otp, name: dto.full_name },
      ),
    ]).catch(() => {
      throw new HttpException(
        AuthServiceErrors.errors.REGISTER,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    const userId = await this.userRepository.findOne({
      where: { email: dto.email },
      select: { id: true },
    });

    return userId;
  }

  async validateUser(email: string, password: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        password: true,
        is_verified: true,
        email: true,
        id: true,
        filled_profile_step: true,
      },
    });

    if (!user) {
      throw new NotFoundException(UsersServiceErrors.errors.NOT_FOUND(email));
    }

    if (!(user && (await bcrypt.compare(password, user.password)))) {
      throw new UnauthorizedException(
        AuthServiceErrors.errors.INVALID_CREDENTIALS,
      );
    }

    return user;
  }

  async login(
    email: string,
    id: string,
    is_verified: boolean,
    filled_profile_step: number,
  ): Promise<AccesResponseDto> {
    const payload = { email, id };
    const newAccessToken = this.jwtService.sign(payload);

    if (!newAccessToken) {
      throw new InternalServerErrorException(
        AuthServiceErrors.errors.ACCESS_TOKEN,
      );
    }

    return {
      id,
      access_token: newAccessToken,
      is_verified,
      filled_profile_step,
    };
  }
}
