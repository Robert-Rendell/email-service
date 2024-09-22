import { EmailService } from "../src/email.service";

describe("Email Service", () => {
  test("it should error when env vars are missing", async () => {
    let error: any;
    try {
      await EmailService.send({
        subject: "hi",
        text: "body",
      });
    } catch (e) {
      error = e;
    }
    expect(error.message).toEqual(
      "Missing required environment variables (EMAIL_HOST, FROM_EMAIL, FROM_EMAIL_PASS, TO_EMAIL)",
    );
  });
});
