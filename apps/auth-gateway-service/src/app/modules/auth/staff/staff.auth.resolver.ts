import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ResponseModel } from '../../../models/custom/common.response.model';
import { Staff } from '../../../models/db/staff.model';
import {
  SendStaffForgotPasswordEmailInput,
  StaffLoginInput,
  StaffPasswordResetInput,
} from './dto/input.dto';
import { B_AuthService } from './staff.auth.service';

import {
  RefreshTokenInput,
  Token,
} from '../../../../lib/auth/dto/refresh_token.input';

@Resolver('StaffAuth')
export class B_AuthResolver {
  constructor(private readonly auth: B_AuthService) {}

  @Query(() => Staff)
  async m_b_auth_getStaffByUsername(@Args('username') username: string) {
    return await this.auth.getStaffByUsername(username);
  }

  @Mutation(() => Token)
  async m_b_auth_login(@Args('data') data: StaffLoginInput) {
    return await this.auth.login(data);
  }

  @Mutation(() => Token)
  async m_b_auth_refreshToken(@Args() { token }: RefreshTokenInput) {
    return this.auth.refreshToken(token);
  }

  @Mutation(() => ResponseModel)
  async m_b_auth_sendForgetPasswordMail(
    @Args('data') data: SendStaffForgotPasswordEmailInput,
  ) {
    return await this.auth.sendStaffForgetPasswordNotification(data);
  }

  @Mutation(() => ResponseModel)
  async m_b_auth_resetPassword(@Args('data') data: StaffPasswordResetInput) {
    return await this.auth.resetStaffPassword(data);
  }
}
