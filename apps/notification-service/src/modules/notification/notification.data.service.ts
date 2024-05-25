import { Injectable } from '@nestjs/common';

import { NotificationData, NotificationEventData } from './dto/response.dto';

import {
  EXTERNAL_NOTIFICATION_METHOD,
  NOTIFICATION_EVENTS,
  NOTIFICATION_EVENTS_ARR,
  NOTIFICATION_TYPE,
} from '../../helpers/notification.constants';
import { fakeTrans } from '../../../../../libs/helpers/common/common.functions';

@Injectable()
export class NotificationDataService {
  userNotificationData(event: NOTIFICATION_EVENTS): NotificationEventData {
    const notification_data: { [key: string]: NotificationEventData } = {};

    const suffix = `${fakeTrans(
      'If this was you, no further action is needed. If you did not, please secure your account immediately by changing your password and reviewing your security settings. For any assistance, contact our support team.',
    )} `;
    const date = new Date();
    const time = `${fakeTrans('on')} ${date.toLocaleDateString()} ${fakeTrans(
      'at',
    )} ${date.toLocaleTimeString()}`;

    for (let i = 0; i < NOTIFICATION_EVENTS_ARR.length; i++) {
      const internal = this.getInternalNotificationData(
        NOTIFICATION_EVENTS_ARR[i],
        time,
        suffix,
      );
      const email = this.getEmailNotificationData(
        NOTIFICATION_EVENTS_ARR[i],
        time,
        suffix,
      );
      const sms = this.getSmsNotificationData(NOTIFICATION_EVENTS_ARR[i], time);

      const external = {
        [EXTERNAL_NOTIFICATION_METHOD.EMAIL]: email,
        [EXTERNAL_NOTIFICATION_METHOD.SMS]: sms,
        [EXTERNAL_NOTIFICATION_METHOD.BOTH]: {
          [EXTERNAL_NOTIFICATION_METHOD.EMAIL]: email,
          [EXTERNAL_NOTIFICATION_METHOD.SMS]: sms,
        },
      };

      notification_data[NOTIFICATION_EVENTS_ARR[i]] = {
        [NOTIFICATION_TYPE.INTERNAL]: internal,
        [NOTIFICATION_TYPE.EXTERNAL]: external,
        [NOTIFICATION_TYPE.BOTH]: {
          [NOTIFICATION_TYPE.INTERNAL]: internal,
          [NOTIFICATION_TYPE.EXTERNAL]: external,
        },
      };
    }

    return notification_data[event];
  }

  private getInternalNotificationData(
    event: NOTIFICATION_EVENTS,
    time?: string,
    suffix?: string,
  ) {
    const notifications: { [key: string]: NotificationData } = {
      [NOTIFICATION_EVENTS.NEW_DEVICE_VERIFICATION]: {
        title: fakeTrans('Login Attempt from New Device'),
        description: `${fakeTrans(
          'We noticed a login attempt to your account from a new device ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.LOGIN_FROM_NEW_IP]: {
        title: fakeTrans('Login Attempt from New IP Address'),
        description: `${fakeTrans(
          'We have detected a login attempt to your account from a new IP address ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.RESET_PASSWORD]: {
        title: fakeTrans('Password Reset Request'),
        description: `${fakeTrans(
          "We've received a request to reset the password for your account. If you initiated this request, please follow the instructions sent to your email to reset your password. If you didn't request this, please secure your account by updating your password and reviewing your security settings. For assistance, feel free to contact our support team.",
        )}`,
      },
      [NOTIFICATION_EVENTS.UPDATE_PASSWORD]: {
        title: fakeTrans('Password Successfully Changed'),
        description: ` ${fakeTrans(
          'We wanted to let you know that your account password was successfully changed ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.DEVICE_VERIFICATION_ENABLE_DISABLE]: {
        title: fakeTrans('Your Device Verification Status Has Changed'),
        description: ` ${fakeTrans(
          'We wanted to inform you that the verification status of your device was updated ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.LOGIN_TWOFA_ENABLE_DISABLE]: {
        title: fakeTrans(
          'Your Two-Factor Authentication Status Has Been Updated',
        ),
        description: `${fakeTrans(
          'We wanted to inform you that the status of your two-factor authentication (2FA) was updated ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.LOGOUT_FROM_OTHER_DEVICE]: {
        title: fakeTrans('Logged Out From Other Devices'),
        description: `${fakeTrans(
          'We want to inform you that you have been logged out from your account on other devices for security reasons ',
        )} ${time} ${suffix}`,
      },
    };
    return notifications[event];
  }

  private getEmailNotificationData(
    event: NOTIFICATION_EVENTS,
    time?: string,
    suffix?: string,
  ) {
    const notifications: { [key: string]: NotificationData } = {
      [NOTIFICATION_EVENTS.NEW_DEVICE_VERIFICATION]: {
        subject: fakeTrans('Login Attempt from New Device'),
        title: fakeTrans('Login Attempt from New Device'),
        description: `${fakeTrans(
          'We detected a login attempt to your account from a new device ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.LOGIN_FROM_NEW_IP]: {
        subject: fakeTrans('Login Attempt from New IP Address'),
        title: fakeTrans('Login Attempt from New IP Address'),
        description: `${fakeTrans(
          'We detected a login attempt to your account from a new IP address ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.RESET_PASSWORD]: {
        subject: fakeTrans('Password Reset Request'),
        title: fakeTrans('Password Reset Request Received'),
        description: `${fakeTrans(
          "We've received a request to reset the password for your account. If you initiated this request, please follow the instructions sent to your email to reset your password. If you didn't request this, please secure your account by updating your password and reviewing your security settings. For assistance, feel free to contact our support team.",
        )}`,
      },
      [NOTIFICATION_EVENTS.UPDATE_PASSWORD]: {
        subject: fakeTrans('Password Successfully Changed'),
        title: fakeTrans('Your Password Has Been Successfully Changed'),
        description: `${fakeTrans(
          'We wanted to let you know that your account password was successfully changed',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.DEVICE_VERIFICATION_ENABLE_DISABLE]: {
        subject: fakeTrans('Device Verification Status Update"'),
        title: fakeTrans('Your Device Verification Status Has Changed'),
        description: `${fakeTrans(
          'We wanted to inform you that the verification status of your device was updated ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.LOGIN_TWOFA_ENABLE_DISABLE]: {
        subject: fakeTrans('Two-Factor Authentication Status Update'),
        title: fakeTrans(
          'Your Two-Factor Authentication Status Has Been Updated',
        ),
        description: `${fakeTrans(
          'We wanted to inform you that the status of your two-factor authentication (2FA) was updated ',
        )} ${time} ${suffix}`,
      },
      [NOTIFICATION_EVENTS.LOGOUT_FROM_OTHER_DEVICE]: {
        subject: fakeTrans('Logged Out From Other Devices'),
        title: fakeTrans('You Have Been Logged Out From Other Devices'),
        description: `${fakeTrans(
          'We want to inform you that you have been logged out from your account on other devices for security reasons ',
        )} ${time} ${suffix}`,
      },
    };
    return notifications[event];
  }

  private getSmsNotificationData(event: NOTIFICATION_EVENTS, time?: string) {
    time = time ?? '';
    const notifications: { [key: string]: NotificationData } = {
      [NOTIFICATION_EVENTS.NEW_DEVICE_VERIFICATION]: {
        description: `${fakeTrans(
          'We detected a login attempt to your account from a new device on ',
        )} ${time}`,
      },
      [NOTIFICATION_EVENTS.LOGIN_FROM_NEW_IP]: {
        description: `${fakeTrans(
          'We have detected a login attempt to your account from a new IP address ',
        )} ${time}`,
      },
      [NOTIFICATION_EVENTS.RESET_PASSWORD]: {
        description: `${fakeTrans(
          "We've received a request to reset the password for your account",
        )} `,
      },
      [NOTIFICATION_EVENTS.UPDATE_PASSWORD]: {
        description: `${fakeTrans(
          'We wanted to let you know that your account password was successfully changed.',
        )} `,
      },
      [NOTIFICATION_EVENTS.DEVICE_VERIFICATION_ENABLE_DISABLE]: {
        description: `${fakeTrans(
          'We wanted to inform you that the verification status of your device was updated ',
        )} ${time}`,
      },
      [NOTIFICATION_EVENTS.LOGIN_TWOFA_ENABLE_DISABLE]: {
        description: `${fakeTrans(
          'We wanted to inform you that the status of your two-factor authentication (2FA) was updated ',
        )} ${time}`,
      },
      [NOTIFICATION_EVENTS.LOGOUT_FROM_OTHER_DEVICE]: {
        description: `${fakeTrans(
          'We want to inform you that you have been logged out from your account on other devices for security reasons.',
        )} `,
      },
    };
    return notifications[event];
  }
}
