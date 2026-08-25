import { registerAs } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  encryption: string | null;
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

export const emailConfig = registerAs('email', (): EmailConfig => {
  const encryption = process.env.MAIL_ENCRYPTION || null;

  return {
    host: process.env.MAIL_HOST || '',
    port: Number(process.env.MAIL_PORT || 0),
    // secure=true only with implicit TLS (port 465 + ssl); STARTTLS (587) uses secure=false.
    secure: encryption === 'ssl',
    encryption: encryption,
    auth: {
      user: process.env.MAIL_USERNAME || '',
      pass: process.env.MAIL_PASSWORD || '',
    },
    from: {
      name: process.env.MAIL_FROM_NAME || '',
      address: process.env.MAIL_FROM_ADDRESS || '',
    },
  };
});
