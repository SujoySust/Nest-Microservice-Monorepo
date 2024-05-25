import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  PasswordResetInput,
  SendAuthVerifyCodeInput,
  SendForgotPasswordOtpInput,
  SignupInput,
  UserLoginInput,
  UserSocialLoginInput,
  VerifyAuthCodeInput,
} from './dto/input.dto';

import { F_AuthService } from './user.auth.service';
import { LoginResponse } from '../../../../lib/auth/models/login_response.model';
import { RefreshTokenInput } from '../../../../lib/auth/dto/refresh_token.input';
import { GqlAuthGuard } from '../../../../lib/auth/gql.auth.guard';
import { UserEntity } from '../../../../lib/decorators/user.decorator';
import { ResponseModel } from '../../../models/custom/common.response.model';
import { User } from '../../../models/db/user.model';

// @UseGuards(CountryCheckGuard)
@Resolver('UserAuth')
export class F_AuthResolver {
  constructor(private readonly auth_service: F_AuthService) {}

  @Mutation(() => LoginResponse)
  async m_f_auth_signup(@Args('data') data: SignupInput) {
    return await this.auth_service.signup(data);
  }

  @Mutation(() => LoginResponse)
  async m_f_auth_login(
    @Args('login_data') loginData: UserLoginInput,
    @Context() context,
  ) {
    const req = context.req;
    return await this.auth_service.login(loginData, req);
  }

  @Mutation(() => LoginResponse)
  async m_f_auth_socialLogin(
    @Args('data') data: UserSocialLoginInput,
    @Context() context,
  ) {
    return this.auth_service.socialLogin(data, context.req);
  }

  @Mutation(() => LoginResponse)
  async m_f_auth_refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.auth_service.refreshToken(token);
  }

  @Mutation(() => ResponseModel)
  async m_f_auth_sendAuthVerificationCode(
    @Args('data') data: SendAuthVerifyCodeInput,
  ) {
    return await this.auth_service.sendAuthVerificationCode(data);
  }

  @Mutation(() => LoginResponse)
  async m_f_auth_verifyAuthCode(
    @Args('data') data: VerifyAuthCodeInput,
    @Context() context,
  ) {
    return await this.auth_service.verifyAuthCode(data, context.req);
  }

  @Mutation(() => ResponseModel)
  async m_f_auth_sendForgetPasswordOtp(
    @Args('data') data: SendForgotPasswordOtpInput,
  ) {
    return await this.auth_service.sendForgetPasswordOtp(data);
  }

  @Mutation(() => ResponseModel)
  async m_f_auth_resetPassword(
    @Args('data') data: PasswordResetInput,
    @Context() context,
  ) {
    return await this.auth_service.resetPassword(data, context.req);
  }

  @UseGuards(GqlAuthGuard())
  @Mutation(() => ResponseModel)
  async m_f_auth_logout(@Context() context, @UserEntity() user: User) {
    return await this.auth_service.logout(context.req, user);
  }

  @Query(() => User)
  async q_f_auth_getUserByCode(@Args('usercode') usercode: string) {
    const user = await this.auth_service.getUserByCode(usercode);
    return this.auth_service.secureUserResponse(user);
  }
}
