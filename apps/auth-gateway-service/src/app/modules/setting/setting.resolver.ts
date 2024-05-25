import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SETTINGS_GROUP } from '../../helpers/slug_constants';
import { ResponseModel } from '../../models/custom/common.response.model';
import { Setting } from '../../models/db/setting.model';
import { apiSettingsInput } from './dto/api_settings.input';
import { applicationSettingsInput } from './dto/application_settings.input';
import { generalSettingsInput } from './dto/general_settings.input';
import { mailSettingsInput } from './dto/mail_settings.input';
import { metaSettingsInput } from './dto/meta_settings.input';
import { socialSettingsInput } from './dto/social_settings.input';
import { SettingService } from './setting.service';

@Resolver()
export class SettingResolver {
  constructor(private readonly settingService: SettingService) {}

  @Query(() => [Setting])
  async q_c_setting_getSettingsData(
    @Args({ name: 'optionGroup', type: () => [String], nullable: true })
    optionGroup?: string[],
    @Args({ name: 'slug', type: () => [String], nullable: true })
    slug?: string[],
  ): Promise<Setting[]> {
    return await this.settingService.getSettingsData(optionGroup, slug, true);
  }

  // @UseGuards(new RolePermissionGuard(URL_KEY.SETTINGS))
  // @UseGuards(GqlAuthGuard('staff'))
  @Query(() => [Setting])
  async q_b_setting_getSettingsData(
    @Args({ name: 'optionGroup', type: () => [String], nullable: true })
    optionGroup?: string[],
    @Args({ name: 'slug', type: () => [String], nullable: true })
    slug?: string[],
  ): Promise<Setting[]> {
    return await this.settingService.getSettingsData(optionGroup, slug);
  }

  // @UseGuards(GqlAuthGuard('staff'))
  // @UseGuards(new RolePermissionGuard(URL_KEY.GENERAL_SETTINGS))
  @Mutation(() => ResponseModel)
  async m_b_setting_generalSettingsSave(
    @Args('data') data: generalSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP.GENERAL);
  }

  // @UseGuards(GqlAuthGuard('staff'))
  // @UseGuards(new RolePermissionGuard(URL_KEY.APPLICATION_SETTINGS))
  @Mutation(() => ResponseModel)
  async m_b_setting_applicationSettingsSave(
    @Args('data') data: applicationSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(
      data,
      SETTINGS_GROUP.APPLICATION,
    );
  }

  // @UseGuards(GqlAuthGuard('staff'))
  // @UseGuards(new RolePermissionGuard(URL_KEY.EMAIL_SETTINGS))
  @Mutation(() => ResponseModel)
  async m_b_setting_mailSettingsSave(
    @Args('data') data: mailSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP.EMAIL);
  }

  // @UseGuards(GqlAuthGuard('staff'))
  // @UseGuards(new RolePermissionGuard(URL_KEY.API_SETTINGS))
  @Mutation(() => ResponseModel)
  async m_b_setting_apiSettingsSave(
    @Args('data') data: apiSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP.API);
  }

  // @UseGuards(GqlAuthGuard('staff'))
  // @UseGuards(new RolePermissionGuard(URL_KEY.SOCIAL_SETTINGS))
  @Mutation(() => ResponseModel)
  async m_b_setting_socialSettingsSave(
    @Args('data') data: socialSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP.SOCIAL);
  }

  // @UseGuards(GqlAuthGuard('staff'))
  // @UseGuards(new RolePermissionGuard(URL_KEY.META_SETTINGS))
  @Mutation(() => ResponseModel)
  async m_b_setting_metaSettingsSave(
    @Args('data') data: metaSettingsInput,
  ): Promise<ResponseModel> {
    return await this.settingService.settingSave(data, SETTINGS_GROUP.META);
  }
}
