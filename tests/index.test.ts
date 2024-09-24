import { SNSEvent } from "aws-lambda";
import { handler } from "../src/index";

function exampleEvent(body?: string) {
  const defaultBody =
  '{\n    "subject": "the subject",\n    "text": "the body"\n}';
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
  describe('SDK event', () => {
    test("it returns an error if the event body is empty", async () => {
      const result = await handler({} as any);
      expect(result).toEqual({
        statusCode: 400,
        // TODO - error messages are vague because the lambda is trying to handle too many different types of events
        body: "Bad input: body is empty",
      });
    });
  
    test("it return an error if the event body does not contain the text property", async () => {
      const result = await handler({
        "subject": "the subject"
      } as any);
      expect(result).toEqual({
        statusCode: 400,
        // TODO - error messages are vague because the lambda is trying to handle too many different types of events
        body: "Bad input: body is empty",
      });
    });
  
    test("it return an error if the event body does not contain the subject property", async () => {
      const result = await handler({
        "text": "the text"
      } as any);
      expect(result).toEqual({
        statusCode: 400,
        // TODO - error messages are vague because the lambda is trying to handle too many different types of events
        body: "Bad input: body is empty",
      });
    });
  
    test("attempts to send email if both subject and text properties exist in post body", async () => {
      const result = await handler({
        subject: "the subject",
        text: "the body",
      } as any);
      expect(result).toEqual({
        body: "Sent!",
        statusCode: 200,
      });
    });
  });

  describe('Function URL event', () => {
    test("it returns an error if the event body is empty", async () => {
      const body = "";
      const result = await handler(exampleEvent(body));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input: body is empty",
      });
    });
  
    test("it returns an error if the event body does not contain the text property", async () => {
      const body = '{\n    "subject": "the subject"}';
      const result = await handler(exampleEvent(body));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input! Properties are empty or not provided in POST body: subject, text, html",
      });
    });
  
    test("it return an error if the event body does not contain the subject property", async () => {
      const body = '{"text": "the body"\n}';
      const result = await handler(exampleEvent(body));
      expect(result).toEqual({
        statusCode: 400,
        body: "Bad input! Properties are empty or not provided in POST body: subject, text, html",
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
