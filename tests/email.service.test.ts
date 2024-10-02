import * as mailer from "nodemailer";
import { EmailService } from "../src/email.service";
import { config } from "dotenv";

jest.mock("nodemailer");
describe("Email Service", () => {
  let sendMailMock: jest.Mock;
  let errorConsoleMock: jest.SpyInstance;

  beforeAll(() => {
    sendMailMock = jest.fn((mailOptions, callback) => {
      callback(new Error("Test error"));
    });
    (mailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    errorConsoleMock = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  test("it should error when env vars are missing", async () => {
    let error: any;
    try {
      await EmailService.send({
        subject: "hi",
        text: "body",
        html: "<p>body</p>",
      });
    } catch (e) {
      error = e;
    }
    expect(error.message).toEqual(
      "Missing required environment variables (EMAIL_HOST, FROM_EMAIL, FROM_EMAIL_PASS, TO_EMAIL)",
    );
  });

  test("should handle error when sending email", async () => {
    config();
    const mailOptions = {
      from: "test@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email",
    };

    await expect(EmailService.send(mailOptions)).rejects.toThrow("Test error");
    expect(sendMailMock).toHaveBeenCalledWith(mailOptions, expect.any(Function));
    expect(errorConsoleMock).toHaveBeenCalledWith(new Error("Test error"));
  });
});
