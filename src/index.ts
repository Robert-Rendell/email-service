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

function isFunctionURLInvocation(event: any): event is APIGatewayProxyEventV2 {
  return "body" in event;
}

function isEventBody(event: any): event is EventBody {
  return "subject" in event && "text" in event;
}

export async function handler(
  event: APIGatewayProxyEventV2 | SNSEvent | EventBody,
): Promise<APIGatewayProxyResult> {
  let eventBody: EventBody;

  if (isEventBody(event)) {
    eventBody = event;
  } else {
    let jsonString;
    if (isSNSEvent(event)) {
      jsonString = event.Records[0].Sns.Message;
    } else {
      if (isFunctionURLInvocation(event)) {
        jsonString = event.body;
      }
      if (!event.body) {
        const errorMsg = "Bad input: body is empty";
        console.log(event);
        console.error(errorMsg);
        return {
          statusCode: 400,
          body: errorMsg,
        };
      }
    }

    try {
      eventBody = JSON.parse(jsonString ?? "");
    } catch (e) {
      const errorMsg = "Bad input: malformed JSON";
      console.error(errorMsg);
      return {
        statusCode: 400,
        body: errorMsg,
      };
    }
  }

  const { subject, text } = eventBody;
  if (!subject || !text) {
    const errorMsg =
      "Bad input: subject or text properties are empty or not provided in POST body";
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
