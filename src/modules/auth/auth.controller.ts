import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ERouteName } from 'src/common/enums/route-name.enum';
import { UserEntity } from 'src/entities/user.entity';
import { SendOtpRequestDto } from 'src/modules/auth/dto/send-otp.request.dto';
import {
  AccesResponseDto,
  AuthReqDto,
} from 'src/modules/auth/dto/sign-in.response.dto';
import { SignUpRequestDto } from 'src/modules/auth/dto/sign-up.request.dto';
import { UserDto } from 'src/modules/auth/dto/user.response.dto';
import { VerifyOtpRequestDto } from 'src/modules/auth/dto/verify-otp.request.dto';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { OtpService } from 'src/modules/auth/services/otp.service';

@ApiTags('Authorization')
@Controller(ERouteName.AUTH_ROUTE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService,
  ) {}
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully registered',
  })
  @Post(ERouteName.SIGNUP_ROUTE)
  public async signUp(@Body() dto: SignUpRequestDto): Promise<UserEntity> {
    return await this.authService.signUp(dto);
  }

  @UseGuards(LocalAuthGuard)
  @Post(ERouteName.SIGNIN_ROUTE)
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiOkResponse({
    description: 'User signed in successfully',
    status: 200,
    type: SignUpRequestDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  async login(@Req() { user }: AuthReqDto): Promise<AccesResponseDto> {
    return this.authService.login(
      user.email,
      user.id,
      user.is_verified,
      user.filled_profile_step,
    );
  }

  @Post(ERouteName.SEND_OTP)
  @ApiOperation({ summary: 'Send otp code to provided email' })
  async restorePassword(@Body() dto: SendOtpRequestDto): Promise<void> {
    return await this.otpService.sendOtp(dto.email);
  }

  @Post(ERouteName.VERIFY_OTP)
  @ApiOperation({ summary: 'Verify provided otp code' })
  async verifyOtp(@Body() dto: VerifyOtpRequestDto): Promise<UserDto> {
    return await this.otpService.verifyOtp(dto.email, dto.otp_code);
  }
}
