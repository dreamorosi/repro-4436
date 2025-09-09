import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
} from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import type { Construct } from 'constructs';

export class TriageStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fnName = 'Triage4436';
    const logGroup = new LogGroup(this, 'MyLogGroup', {
      logGroupName: `/aws/lambda/${fnName}`,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.ONE_DAY,
    });
    const fn = new NodejsFunction(this, 'MyFunction', {
      functionName: fnName,
      logGroup,
      runtime: Runtime.NODEJS_22_X,
      entry: './src/index.ts',
      handler: 'handler',
      bundling: {
        minify: true,
        mainFields: ['module', 'main'],
        sourceMap: true,
        format: OutputFormat.ESM,
      },
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    // Dead Letter Queue for failed SQS messages
    const dlq = new Queue(this, 'SqsDLQ', {
      queueName: 'Triage4436-DLQ',
      retentionPeriod: Duration.days(14),
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Main SQS queue with DLQ configured
    const queue = new Queue(this, 'MainQueue', {
      queueName: 'Triage4436',
      retentionPeriod: Duration.days(14),
      removalPolicy: RemovalPolicy.DESTROY,
      deadLetterQueue: {
        maxReceiveCount: 1, // After 1 failed receives, message goes to DLQ
        queue: dlq,
      },
    });

    fn.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 10,
        maxBatchingWindow: Duration.seconds(1),
        reportBatchItemFailures: true,
      })
    );

    new CfnOutput(this, 'FunctionArn', {
      value: fn.functionArn,
    });

    new CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl,
    });
  }
}
