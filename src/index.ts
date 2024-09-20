import { config } from "dotenv";
import { EmailService } from "./email.service";
config();

type EventBody = {
  subject: string | undefined;
  text: string | undefined;
};

export async function handler(event: { body: string }) {
  let eventBody: EventBody;
  try {
    eventBody = JSON.parse(event.body);
  } catch (e) {
    return {
      statusCode: 400,
      body: "Bad input: malformed JSON",
    };
  }
  const { subject, text } = eventBody;
  if (!subject || !text) {
    return {
      statusCode: 400,
      body: "Bad input: subject or text properties not provided in POST body",
    };
  }
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
