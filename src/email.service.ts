import * as mailer from "nodemailer";

export type EmailOptions = {
  from?: string;
  to?: string;
  subject: string;
  /**
   * email body
   */
  text: string;
};

export class EmailService {
  public static send(emailOptions: EmailOptions): Promise<boolean> {
    if (
      !process.env.FROM_EMAIL ||
      !process.env.FROM_EMAIL_PASS ||
      !process.env.TO_EMAIL ||
      !process.env.EMAIL_HOST
    )
      throw Error(
        "Missing required environment variables (EMAIL_HOST, FROM_EMAIL, FROM_EMAIL_PASS, TO_EMAIL)",
      );

    const defaultOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
    };
    return new Promise((resolve) => {
      const transporter = mailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.FROM_EMAIL,
          pass: process.env.FROM_EMAIL_PASS,
        },
      });
      const mailOptions = { ...emailOptions };
      if (!mailOptions.from) mailOptions.from = defaultOptions.from;
      if (!mailOptions.to) mailOptions.to = defaultOptions.to;
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error(error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
