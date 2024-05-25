import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../../../../libs/auth/password.service';
import { postgres_client, setApp } from '../../../helpers/core_functions';

import { PassportModule } from '@nestjs/passport';
import { TestModuleDependecy } from '../../../../../test/utils/unit/module.dependency';
import { SecurityConfig } from '../../../../configs/config.interface';
import { JwtHelper } from '../../../../libs/auth/jwt.helper';
import { PrismaService } from '../../../../libs/prisma/prisma.service';
import { AuthModule } from '../auth.module';
import { B_AuthService } from '../staff/staff.auth.service';

describe('StaffAuthService', () => {
  let staffAuthService: B_AuthService;
  let app: INestApplication;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        ...TestModuleDependecy(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          useFactory: async (configService: ConfigService) => {
            const securityConfig =
              configService.get<SecurityConfig>('security');
            return {
              secret: securityConfig.accessSecret,
              signOptions: {
                expiresIn: securityConfig.expiresIn,
              },
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [PasswordService, JwtHelper, PrismaService],
    }).compile();

    app = module.createNestApplication();
    setApp(app);
    await app.init();

    staffAuthService = module.get<B_AuthService>(B_AuthService);
  });

  it('Should be defined', () => {
    expect(staffAuthService).toBeDefined();
  });

  describe('StaffLogin', () => {
    it('Should return auth token', async () => {
      const result = await staffAuthService.login({
        username: 'admin@email.com',
        password: '12345678',
      });
      expect(result.accessToken).toBeDefined();
    });
    it('Should return error', async () => {
      try {
        await staffAuthService.login({
          username: 'admin@email.com',
          password: '123456783323',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  // describe('sendStaffForgetPasswordNotification', () => {
  //   it('Should return success response', async () => {
  //     const result = await staffAuthService.sendStaffForgetPasswordNotification(
  //       {
  //         email: 'admin@email.com',
  //       },
  //     );
  //     expect(result.success).toBeTruthy();
  //     expect(result.message).toBe('Forget password mail sent successfully!');
  //   });
  // });

  describe('resetStaffPassword', () => {
    it('Should return success response', async () => {
      const code = '511112';
      await postgres_client.staff.update({
        where: {
          email: 'admin@email.com',
        },
        data: {
          resetCode: code,
        },
      });
      const result = await staffAuthService.resetStaffPassword({
        code: code,
        password: '12345678',
        password_confirm: '12345678',
        email: 'admin@email.com',
      });
      expect(result.success).toBeTruthy();
      expect(result.message).toBe('Password changed successfully!');
    });
  });

  describe('getUserByIdentifier', () => {
    it('Should return a stuff by id', async () => {
      const id = 1;
      const result = await staffAuthService.getUserByIdentifier(id);
      expect(result).toBeDefined();
      expect(result.id).toBe(id);
    });
  });

  describe('getUserFromToken', () => {
    it('Should return a stuff by token', async () => {
      const user = await staffAuthService.login({
        username: 'admin@email.com',
        password: '12345678',
      });
      const result = await staffAuthService.getUserFromToken(user.accessToken);
      expect(result).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
