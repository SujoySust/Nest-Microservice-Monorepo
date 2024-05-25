import { Request } from 'express';
import { Staff } from '../../../app/models/db/staff.model';
import { Token } from '../dto/refresh_token.input';
import { LoginResponse } from '../models/login_response.model';
import { User } from '../../../app/models/db/user.model';

export interface AuthServiceInterface {
  login(payload, req?: Request): Promise<LoginResponse | Token>;
  getUserByIdentifier(
    authIdentifier: string | number | bigint,
    login_secret?: string,
  ): Promise<User | Staff>;
  getUserFromToken(token: string): Promise<User | Staff>;
  refreshToken(token: string): LoginResponse | Token;
}
