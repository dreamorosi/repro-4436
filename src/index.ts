import { BatchProcessor, EventType } from '@aws-lambda-powertools/batch';
import { Logger } from '@aws-lambda-powertools/logger';
import type { SqsRecord } from '@aws-lambda-powertools/parser/types';
import type { Context, SQSEvent } from 'aws-lambda';
import z from 'zod';

const myItemSchema = z.object({
  foo: z.string(),
});

const processor = new BatchProcessor(EventType.SQS, {
  schema: myItemSchema,
});
const logger = new Logger();

const recordHandler = async ({
  messageId,
  body,
}: Omit<SqsRecord, 'body'> & {
  body: z.infer<typeof myItemSchema>;
}) => {
  logger.info(`Processing record: ${messageId}`, {
    body,
  });
};

export const handler = async (event: SQSEvent, context: Context) => {
  logger.logEventIfEnabled(event);
  processor.register(event.Records, recordHandler, {
    context,
    throwOnFullBatchFailure: false,
  });

  const processedMessages = await processor.process();
  const failed = processedMessages.filter(([status]) => status === 'fail');
  logger.error('Failed to process messages', {
    failedMessages: failed.map(([_, error, record]) => ({
      error,
      record,
    })),
  });

  return processor.response();
};
