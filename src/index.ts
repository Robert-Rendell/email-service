import { config } from "dotenv";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResult,
  SNSEvent,
} from "aws-lambda";
import { EmailService } from "./email.service";
config();

type EventBody = {
  subject: string | undefined;
  text: string | undefined;
};

function isSNSEvent(event: any): event is SNSEvent {
  return "Records" in event;
}

export async function handler(
  event: APIGatewayProxyEventV2 | SNSEvent,
): Promise<APIGatewayProxyResult> {
  let eventBody: EventBody;

  let jsonString;
  if (isSNSEvent(event)) {
    jsonString = event.Records[0].Sns.Message;
  } else {
    if (!event.body) {
      const errorMsg = "Bad input: body is empty";
      console.log(event);
      console.error(errorMsg);
      return {
        statusCode: 400,
        body: errorMsg,
      };
    }
    jsonString = event.body;
  }

  try {
    eventBody = JSON.parse(jsonString);
  } catch (e) {
    const errorMsg = "Bad input: malformed JSON";
    console.error(errorMsg);
    return {
      statusCode: 400,
      body: errorMsg,
    };
  }

  const { subject, text } = eventBody;
  if (!subject || !text) {
    const errorMsg =
      "Bad input: subject or text properties not provided in POST body";
    console.error(errorMsg);
    return {
      statusCode: 400,
      body: errorMsg,
    };
  }
  try {
    await EmailService.send({
      subject,
      text,
    });
    console.log("Email sent!");
    return {
      statusCode: 200,
      body: "Sent!",
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
}
