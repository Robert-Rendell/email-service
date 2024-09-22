# Email Service AWS Lambda

`aws cloudformation describe-stacks --stack-name EmailServiceStack`

## Configuration
Copy the contents of `.env.deployment` to a new file called `.env` and provide the environment variables for runtime.

## Invoking

Use the following POST json body structure:
```typescript
{
    subject: string,
    body: string
}
```

## AWS CDK managed monorepo
`cdk bootstrap`
`cdk synth`
`cdk diff`
`cdk deploy`

## Tailing logs
`aws logs tail /aws/lambda/EmailServiceStack-EmailServiceXXXXXXXX-xxxxxxxxxxxx --follow`