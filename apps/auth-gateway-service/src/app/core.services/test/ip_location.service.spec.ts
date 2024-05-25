import { HttpModule } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../libs/prisma/prisma.service';
import { setApp } from '../../helpers/core_functions';
import { IpLocationService } from '../ip_location.service';

describe('IpLocationService', () => {
  let ipLocationService: IpLocationService;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [PrismaService, IpLocationService],
    }).compile();

    app = module.createNestApplication();
    setApp(app);
    await app.init();

    ipLocationService = module.get<IpLocationService>(IpLocationService);
  });

  describe('getOrCreateIpLocation', () => {
    it('Should return location', async () => {
      const result =
        await ipLocationService.getOrCreateIpLocation('115.127.97.52');
      console.log(result);
      expect(result).toBeDefined();
    }, 150000);
  });

  afterAll(async () => {
    await app.close();
  });
});
