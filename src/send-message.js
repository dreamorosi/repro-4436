import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const client = new SQSClient({ region: "eu-west-1" });

const params = {
  QueueUrl: "https://sqs.eu-west-1.amazonaws.com/536254204126/Triage4436",
  MessageBody: JSON.stringify({ foo: "string" }),
  MessageAttributes: {
    baggage: {
      StringValue: "baggageAttr=someVal",
      BinaryValue: null,
      DataType: "String"
    }
  }
};

try {
  const result = await client.send(new SendMessageCommand(params));
  console.log("Message sent successfully:", result.MessageId);
} catch (error) {
  console.error("Error sending message:", error);
}
