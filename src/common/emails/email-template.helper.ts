import type {
  EmailAction,
  EmailTemplateOptions,
} from '@/common/types/email-template.type';
import mjml from 'mjml';

// Design tokens: 570px card on a gray background, using the system font stack.
const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const TEXT = '#18181b';
const MUTED = '#52525b';
const FOOTER_TEXT = '#a1a1aa';
const BORDER = '#e4e4e7';
const CANVAS = '#fafafa';
const CARD = '#ffffff';
const CARD_WIDTH = '570px';

const escapeText = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeAttr = (value: string): string =>
  escapeText(value).replace(/"/g, '&quot;');

/**
 * MJML email template with a card design shared by every message.
 */
export class EmailTemplateHelper {
  /**
   * Generates the HTML of an email from the base template.
   */
  static async generateEmail(options: EmailTemplateOptions): Promise<string> {
    const appName = process.env.APP_NAME ?? 'App';
    const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );

    const body = [
      options.greeting ? this.heading(options.greeting) : '',
      ...(options.introLines ?? []).map((line) => this.paragraph(line)),
      options.action ? this.button(options.action) : '',
      ...(options.outroLines ?? []).map((line) => this.paragraph(line)),
      options.salutation ? this.paragraph(options.salutation) : '',
      options.action && options.subcopy
        ? this.subcopy(options.subcopy, options.action)
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const year = new Date().getFullYear();
    const rights = options.rights
      ? `© ${year} ${escapeText(appName)}. ${escapeText(options.rights)}`
      : `© ${year} ${escapeText(appName)}`;

    const template = `
      <mjml>
        <mj-head>
          <mj-title>${escapeText(appName)}</mj-title>
          <mj-attributes>
            <mj-all font-family="${FONT}" />
            <mj-text font-size="16px" color="${MUTED}" line-height="1.5" padding="0 0 16px 0" />
            <mj-section padding="0" />
          </mj-attributes>
          <mj-style>
            .break-all { word-break: break-all; }
            .subcopy { border-top: 1px solid ${BORDER}; }
          </mj-style>
        </mj-head>

        <mj-body background-color="${CANVAS}" width="${CARD_WIDTH}">
          <mj-section padding="25px 0">
            <mj-column>
              <mj-text align="center" padding="0">
                <a href="${escapeAttr(appUrl)}" style="color: ${TEXT}; font-size: 19px; font-weight: bold; text-decoration: none;">
                  ${escapeText(appName)}
                </a>
              </mj-text>
            </mj-column>
          </mj-section>

          <mj-section
            background-color="${CARD}"
            border="1px solid ${BORDER}"
            border-radius="4px"
            padding="32px"
          >
            <mj-column>
              ${body}
            </mj-column>
          </mj-section>

          <mj-section padding="32px">
            <mj-column>
              <mj-text align="center" color="${FOOTER_TEXT}" font-size="12px" padding="0">
                ${rights}
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-body>
      </mjml>
    `;

    const { html } = await mjml(template);

    return html;
  }

  private static heading(text: string): string {
    return `<mj-text color="${TEXT}" font-size="18px" font-weight="bold">${escapeText(text)}</mj-text>`;
  }

  private static paragraph(text: string): string {
    return `<mj-text>${escapeText(text)}</mj-text>`;
  }

  private static button(action: EmailAction): string {
    return `<mj-button
      href="${escapeAttr(action.url)}"
      background-color="${TEXT}"
      color="#ffffff"
      border-radius="4px"
      font-size="16px"
      inner-padding="8px 18px"
      padding="30px 0"
    >${escapeText(action.text)}</mj-button>`;
  }

  private static subcopy(template: string, action: EmailAction): string {
    const text = escapeText(template.replace('{actionText}', action.text));
    const href = escapeAttr(action.url);
    const label = escapeText(action.url);

    return `<mj-text css-class="subcopy" font-size="14px" padding="25px 0 0 0">
      ${text}
      <span class="break-all"><a href="${href}" style="color: ${TEXT}; word-break: break-all;">${label}</a></span>
    </mj-text>`;
  }

  /**
   * Info block with a side border, for listing label/value pairs.
   */
  static createInfoBox(
    items: Array<{ label: string; value: string }>,
    borderColor = TEXT,
  ): string {
    const rows = items
      .map(
        (item) =>
          `<p style="margin: 8px 0;"><strong style="color: ${borderColor};">${escapeText(item.label)}:</strong> ${escapeText(item.value)}</p>`,
      )
      .join('');

    return `
      <mj-table padding="20px 0">
        <tr style="border-left: 4px solid ${borderColor}; background-color: ${CANVAS};">
          <td style="padding: 20px;">${rows}</td>
        </tr>
      </mj-table>
    `;
  }
}
