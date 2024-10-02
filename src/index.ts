import { config } from "dotenv";
import { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";
import { EmailService } from "./email.service";
config();

type EventBody = {
  subject: string | undefined;
  text: string | undefined;
  html: string | undefined;
};

function isFunctionURLInvocation(event: any): event is APIGatewayProxyEventV2 {
  return "body" in event;
}

function isEventBody(event: any): event is EventBody {
  return "subject" in event && ("text" in event || "html" in event);
}

export async function handler(
  event: APIGatewayProxyEventV2 | EventBody,
): Promise<APIGatewayProxyResult> {
  let eventBody: EventBody;

  if (isEventBody(event)) {
    eventBody = event;
  } else {
    let jsonString;
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

  const { subject, text, html } = eventBody;
  if (!subject || (!text && !html)) {
    const errorMsg =
      "Bad input! Properties are empty or not provided in POST body: subject, text, html";
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
      html,
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
