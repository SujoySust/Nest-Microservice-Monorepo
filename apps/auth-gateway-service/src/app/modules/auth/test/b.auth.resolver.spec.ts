import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { B_AuthResolver } from '../staff/staff.auth.resolver';
import { B_AuthService } from '../staff/staff.auth.service';

describe('AuthResolver', () => {
  let backofficeAuthResolver: B_AuthResolver;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [ConfigService, B_AuthResolver, B_AuthService],
    })
      .overrideProvider(B_AuthService)
      .useValue({})
      .compile();
    backofficeAuthResolver = module.get<B_AuthResolver>(B_AuthResolver);
  });

  it('Should be defined', () => {
    expect(backofficeAuthResolver).toBeDefined();
  });
});
