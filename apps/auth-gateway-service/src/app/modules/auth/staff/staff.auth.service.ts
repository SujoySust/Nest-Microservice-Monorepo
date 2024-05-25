import { BadRequestException, Injectable } from '@nestjs/common';

import { ResponseModel } from '../../../models/custom/common.response.model';
import { Staff } from '../../../models/db/staff.model';
import {
  SendStaffForgotPasswordEmailInput,
  StaffLoginInput,
  StaffPasswordResetInput,
} from './dto/input.dto';

import { AuthServiceInterface } from '../../../../lib/auth/interfaces/auth.service.interface';
import { JwtHelper } from '../../../../lib/auth/jwt.helper';
import { PasswordService } from '../../../../lib/auth/password.service';

import {
  postgres_client,
  errorResponse,
  validateUserAccountAndThrowErr,
  successResponse,
  processException,
  __,
  getRandomInt,
} from '../../../helpers/core_function';
import { Token } from '../../../../lib/auth/dto/refresh_token.input';

@Injectable()
export class B_AuthService implements AuthServiceInterface {
  constructor(
    private readonly jwtHelper: JwtHelper,
    private readonly passwordService: PasswordService,
  ) {}

  async getStaffByUsername(username: string): Promise<Staff> {
    const staff = await postgres_client.staff.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email: username,
          },
        ],
      },
    });
    if (!staff) {
      throw new BadRequestException(errorResponse(__('No staff found!')));
    }
    return staff;
  }

  async login(data: StaffLoginInput): Promise<Token> {
    const { username, password } = data;
    const staff = await this.getStaffByUsername(username);

    const passwordValid = await this.passwordService.validatePassword(
      password,
      staff.password,
    );

    if (!passwordValid) {
      throw new BadRequestException(errorResponse(__('Invalid password!')));
    }

    validateUserAccountAndThrowErr(staff);
    return <Token>(
      this.jwtHelper.generateToken({ authIdentifier: staff.id }, 'staff')
    );
  }

  async sendStaffForgetPasswordNotification(
    payload: SendStaffForgotPasswordEmailInput,
  ): Promise<ResponseModel> {
    try {
      const staff = await postgres_client.staff.findUnique({
        where: payload,
      });
      if (!staff) {
        throw new BadRequestException(errorResponse(__('No staff found!')));
      }
      const reset_code = getRandomInt(6).toString();

      await postgres_client.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          resetcode: reset_code,
        },
      });

      // TODO: send notificaiton from here

      // const res = await sendHttpPostRequest(
      //   SERIVCE_URL.NOTIFICATION_SERVICE,
      //   'notifications/send',
      //   {
      //     user_type: USER_TYPE.STAFF,
      //     notification_type: NOTIFICATION_TYPE.EXTERNAL,
      //     method: EXTERNAL_NOTIFICATION_METHOD.EMAIL,
      //     event: USER_NOTIFICATION_EVENTS.RESET_PASSWORD,
      //   },
      //   staff.id,
      // );

      // if (!res.success) {
      //   throw new BadRequestException(
      //     errorResponse(__('Reset password mail sending failed!')),
      //   );
      // }

      return successResponse(__('Reset password mail sent successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async resetStaffPassword(
    payload: StaffPasswordResetInput,
  ): Promise<ResponseModel> {
    try {
      const staff = await postgres_client.staff.findFirst({
        where: {
          AND: {
            email: payload.email,
            resetcode: payload.code,
          },
        },
      });
      if (!staff) {
        throw new BadRequestException(errorResponse(__('No staff found!')));
      }
      const hashedPassword = await this.passwordService.hashPassword(
        payload.password,
      );
      await postgres_client.staff.update({
        where: {
          id: staff.id,
        },
        data: {
          password: hashedPassword,
          resetcode: null,
        },
      });
      return successResponse(__('Password changed successfully!'));
    } catch (e) {
      processException(e);
    }
  }

  async getUserByIdentifier(
    authIdentifier: string | number | bigint,
  ): Promise<Staff> {
    return postgres_client.staff.findUnique({
      where: { id: Number(authIdentifier) },
      include: { role: true },
    });
  }

  async getUserFromToken(token: string): Promise<Staff> {
    const { authIdentifier } = this.jwtHelper.authIdentifierFromToken(token);
    return postgres_client.staff.findUnique({ where: { id: authIdentifier } });
  }

  refreshToken(token: string): Token {
    return <Token>this.jwtHelper.refreshToken(token);
  }
}
