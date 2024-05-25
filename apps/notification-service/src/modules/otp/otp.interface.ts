import { ResponseModel, UserModel } from '../../helpers/core_types';
import { SendOtpDto, VerifyOtpDto } from './dto/input.dto';

export interface OtpInterface {
  send(user: UserModel, data: SendOtpDto): Promise<ResponseModel>;
  verify(user: UserModel, data: VerifyOtpDto): Promise<ResponseModel>;
}
