# Triage Issue 4436

This repository contains a sample Node.js project to deploy a AWS Lambda function using the AWS Cloud Development Kit (CDK). The main goal of this project is to reproduce the issue at aws-powertools/powertools-lambda-typescript#4436.

## Reproduction Steps

1. Clone the repository to your local machine.
2. Run `npm ci` to install dependencies.
3. Deploy the stack using `npm run cdk deploy`.
4. Copy the SQS queue name/url from the stack outputs to the `src/send-message.js` file.
5. Run `npm run cdk watch` to enable live reloading and stream logs.
6. Send a test message to the queue by running `node src/send-message.js`.
7. Observe the logs, which should contain a log similar to the one below:

```json
{
  "level": "ERROR",
  "message": "Failed to process messages",
  "timestamp": "2025-09-09T07:47:48.488Z",
  "service": "service_undefined",
  "sampling_rate": 0,
  "xray_trace_id": "1-68bfdba3-b4a5ff98e63c4ceac2fc9f6b",
  "failedMessages": [
    {
      "error": "Failed to parse record",
      "record": {
        "messageId": "8ca802d1-27d2-4f5d-8ee2-bb25b1fc3633",
        "receiptHandle": "AQEBklCMHdV/MoXxPtkGqLj6ErCJ2MgSWmzwp6xlEHRrrCajDqTfI37bACN8PmANEbsCiFcvwnpEqvYhuFc/ocNKhRf8LL+ngLkLpRTS2o+qfjBasWppRpPt8gj9kTLxpvtE5up9vPa0bTb7G0Sn4En0T1n1D1Q+1Ua8EWPBhKalHcTrOhraxaOImjKfehhVsJPKNVHj4eI9O9VhF3GCjpAXm3C5+Gba3865PQd5fcA5o0RYOfJb8VF6NPJvHi3yK1aW4geNP83SKkxlt3+jxHygf8yEP2B8D+q2gJKi5FgFy46onsOEFLrpFHgt535FTFV04yBeEdhVCjrnqMhN39a6Cw+/rgfgb7oOnQGhdIw2sWf8uxbGVeAYgyCUNwwYDs2Q",
        "body": "{\"foo\":\"string\"}",
        "attributes": {
          "ApproximateReceiveCount": "1",
          "SentTimestamp": "1757404060666",
          "SenderId": "AROAXZWZ5ZDPNIH6C6ODK:aamorosi-Isengard",
          "ApproximateFirstReceiveTimestamp": "1757404060680"
        },
        "messageAttributes": {
          "baggage": {
            "stringValue": "baggageAttr=someVal",
            "binaryValue": null,
            "stringListValues": [],
            "binaryListValues": [],
            "dataType": "String"
          }
        },
        "md5OfMessageAttributes": "c463394b93aa40fde42d504642922761",
        "md5OfBody": "a9882e1d763c321885eb14f5b9db5db3",
        "eventSource": "aws:sqs",
        "eventSourceARN": "arn:aws:sqs:eu-west-1:123456789012:Triage4436",
        "awsRegion": "eu-west-1"
      }
    }
  ]
}
```

## Architecture

The project follows a standard AWS CDK project structure:

- `bin/` - Contains the entry point for the CDK application
- `lib/` - Contains the CDK stack definition
- `src/` - Contains the Lambda function code
- `test/` - Contains test files
- `events/` - Contains sample event payloads for testing

The main stack is defined in `lib/triage-stack.ts` and creates:

1. A Lambda function running Node.js called `TriageFn`
2. A CloudWatch Log Group for the Lambda function
3. CloudFormation outputs for key resources

The Lambda function code is in `src/index.ts` and is currently a simple "Hello World" function that returns a 200 status code.

## Commands

### Deployment Commands

```bash
# Deploy the CDK stack
npm run cdk deploy

# Deploy the stack in watch mode (auto-redeploy on changes + stream logs)
npm run cdk deploy -- --watch

# Deploy function with hotswap enabled (faster iterations for code changes)
npm run cdk deploy -- --hotswap

# Synthesize CloudFormation template without deploying
npm run cdk synth

# Bootstrap the CDK environment (only needed once per environment)
npm run cdk bootstrap
```

### Unit Tests

```bash
# Run all tests
npm test

# Run a specific test file
npx vitest src/path/to/test.test.ts

# Run tests in watch mode
npx vitest
```

### Linting Commands

```bash
# Run Biome linter
npm run lint

# Run Biome formatter
npm run lint:fix
```

## Useful information

- The Lambda function is written in TypeScript, but if you need to troubleshoot JavaScript issues, you can:
  - Rename the file from `src/index.ts` to `src/index.js`
  - Update the `entry` in `lib/triage-stack.ts` to point to `src/index.js`
  - Remove types from the handler function signature in `src/index.js`:

    ```javascript
    export const handler = async (event, context) => {
      return {
        statusCode: 200,
        body: JSON.stringify('Hello, World!'),
      };
    };
    ```

- The project uses ESM modules (note the `"type": "module"` in package.json) and outputs JavaScript files in ESM format. If you need to switch to CommonJS, you only need to:
  - change the `format: OutputFormat.ESM,` line in `lib/triage-stack.ts` to `format: OutputFormat.CJS,`
  - remove the `banner` in the `bundling` options of the `NodejsFunction` construct.
- The project comes with the three Powertools for AWS core utilities installed, you can add more as needed by running `npm install @aws-lambda-powertools/<utility>`.
