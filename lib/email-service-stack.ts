import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { config } from "dotenv";
config();

export class EmailServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    if (
      !process.env.MAILER_SERVICE ||
      !process.env.FROM_EMAIL ||
      !process.env.FROM_EMAIL_PASS ||
      !process.env.TO_EMAIL
    )
      throw Error(
        "Missing required environment variables (MAILER_SERVICE, FROM_EMAIL, FROM_EMAIL_PASS, TO_EMAIL)",
      );

    const emailServiceLambda = new lambda.Function(this, "EmailService", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "..", "dist")),
      environment: {
        MAILER_SERVICE: process.env.MAILER_SERVICE,
        FROM_EMAIL: process.env.FROM_EMAIL,
        FROM_EMAIL_PASS: process.env.FROM_EMAIL_PASS,
        TO_EMAIL: process.env.TO_EMAIL,
      },
      timeout: cdk.Duration.seconds(15),
    });

    const emailServiceFunctionUrl = emailServiceLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // Define a CloudFormation output for the function URL
    new cdk.CfnOutput(this, "EmailServiceUrlOutput", {
      value: emailServiceFunctionUrl.url,
    });
  }
}
