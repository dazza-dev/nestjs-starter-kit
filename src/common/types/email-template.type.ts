export interface EmailAction {
  text: string;
  url: string;
}

export interface EmailTemplateOptions {
  title: string;
  greeting?: string;
  introLines?: string[];
  action?: EmailAction;
  outroLines?: string[];
  salutation?: string;

  /** Text of the closing block that repeats the link, with {actionText} as a placeholder. */
  subcopy?: string;

  /** Footer rights sentence; the template fills in the year and app name. */
  rights?: string;
}
