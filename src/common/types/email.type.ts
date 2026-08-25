export interface EmailAddress {
  name: string;
  address: string;
}

export interface EmailAttachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | EmailAddress | Array<string | EmailAddress>;
  subject: string;
  text?: string;
  html?: string;
  cc?: string | EmailAddress | Array<string | EmailAddress>;
  bcc?: string | EmailAddress | Array<string | EmailAddress>;
  attachments?: EmailAttachment[];
  replyTo?: string | EmailAddress;
}

export interface EmailResponse {
  accepted: string[];
  rejected: string[];
  messageId: string;
}
