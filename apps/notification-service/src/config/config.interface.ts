export interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  encryption: string;
}

export interface MailConfig {
  defaultMailer: string;
  mailers: {
    smtp: SmtpConfig;
    // log: FileTransportOptions;
  };
  from: {
    address: string;
    name: string;
  };
}
