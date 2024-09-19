import { config } from "dotenv";
import { EmailService } from "./email.service";
config();

export async function handler(event: any) {
  const subject = "test1";
  const text = "test2";
  try {
    await EmailService.send({
      subject,
      text,
    });
    return {
      statusCode: 200,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
}
