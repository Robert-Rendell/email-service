import { SNSEvent } from "aws-lambda";
import { handler } from "../src/index";

function exampleEvent(body?: string, eventType: 'sns' | 'url' = 'url') {
  const defaultBody =
  '{\n    "subject": "the subject",\n    "text": "the body"\n}';
  if (eventType === 'sns') {
    return <SNSEvent>{
      Records: [
        {
          EventSource: 'aws:sns',
          EventVersion: '1.0',
          EventSubscriptionArn: 'arn:aws:sns:eu-west-1:XXXXX:CustomAnalyticsStack-CustomAnalyticsTopicXXXXXX',
          Sns: {
            Message: body ?? defaultBody,
          }
        }
      ]
    }
  }
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath: "/",
    rawQueryString: "",
    headers: {
      "content-length": "56",
      "x-amzn-tls-version": "TLSv1.3",
      "x-forwarded-proto": "https",
      "postman-token": "",
      "x-forwarded-port": "443",
      "x-forwarded-for": "",
      accept: "*/*",
      "x-amzn-tls-cipher-suite": "TLS_AES_128_GCM_SHA256",
      "x-amzn-trace-id": "",
      host: "",
      "content-type": "application/json",
      "accept-encoding": "gzip, deflate, br",
      "user-agent": "PostmanRuntime/7.42.0",
    },
    requestContext: {
      accountId: "anonymous",
      apiId: "",
      domainName: "",
      domainPrefix: "",
      http: {
        method: "POST",
        path: "/",
        protocol: "HTTP/1.1",
        sourceIp: "",
        userAgent: "PostmanRuntime/7.42.0",
      },
      requestId: "",
      routeKey: "$default",
      stage: "$default",
      time: "20/Sep/2024:11:43:41 +0000",
      timeEpoch: 1726832621593,
    },
    body: body ?? defaultBody,
    isBase64Encoded: false,
  };
}

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest
      .fn()
      .mockImplementation((mailoptions: any, callback: any) => {
        callback();
      }),
  }),
}));

jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'log').mockImplementation();

describe("index.handler", () => {
  describe('SNS event', () => {
    test("it return an error if the event body is empty", async () => {
      const body = "";
      const result = await handler(exampleEvent(body, 'sns'));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: malformed JSON",
      });
    });
  
    test("it return an error if the event body does not contain the text property", async () => {
      const body = '{\n    "subject": "the subject"}';
      const result = await handler(exampleEvent(body, 'sns'));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: subject or text properties not provided in POST body",
      });
    });
  
    test("it return an error if the event body does not contain the subject property", async () => {
      const body = '{"text": "the body"\n}';
      const result = await handler(exampleEvent(body, 'sns'));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: subject or text properties not provided in POST body",
      });
    });
  
    test("attempts to send email if both subject and text properties exist in post body", async () => {
      const result = await handler(exampleEvent(undefined, 'sns'));
      expect(result).toEqual({
        body: "Sent!",
        statusCode: 200,
      });
    });
  });

  describe('Function URL event', () => {
    test("it return an error if the event body is empty", async () => {
      const body = "";
      const result = await handler(exampleEvent(body));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: body is empty",
      });
    });
  
    test("it return an error if the event body does not contain the text property", async () => {
      const body = '{\n    "subject": "the subject"}';
      const result = await handler(exampleEvent(body));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: subject or text properties not provided in POST body",
      });
    });
  
    test("it return an error if the event body does not contain the subject property", async () => {
      const body = '{"text": "the body"\n}';
      const result = await handler(exampleEvent(body));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: subject or text properties not provided in POST body",
      });
    });
  
    test("attempts to send email if both subject and text properties exist in post body", async () => {
      const result = await handler(exampleEvent());
      expect(result).toEqual({
        body: "Sent!",
        statusCode: 200,
      });
    });
  })
 
});
