import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

import {
  SNSClient,
  PublishCommand
} from "@aws-sdk/client-sns";


const REGION =
  process.env.AWS_REGION;


const TABLE_NAME =
  process.env.TABLE_NAME;


const EXCURSION_TOPIC_ARN =
  process.env.EXCURSION_TOPIC_ARN;


// ======================================================
// DYNAMODB CLIENT
// ======================================================

const dynamoClient =
  new DynamoDBClient({
    region: REGION
  });


const dynamo =
  DynamoDBDocumentClient.from(
    dynamoClient
  );


// ======================================================
// SNS CLIENT
// ======================================================

const sns =
  new SNSClient({
    region: REGION
  });


// ======================================================
// FIND ONE READING
// ======================================================

export async function findReadingByTimestamp(
  branchId,
  recordedAt
) {

  const result =
    await dynamo.send(
      new QueryCommand({

        TableName:
          TABLE_NAME,

        KeyConditionExpression:
          "branchId = :branchId AND begins_with(readingKey, :recordedAt)",

        ExpressionAttributeValues: {

          ":branchId":
            branchId,

          ":recordedAt":
            `${recordedAt}#`
        },

        Limit: 1
      })
    );


  return result.Items?.[0];
}


// ======================================================
// QUERY BRANCH READINGS
// ======================================================

export async function queryBranchReadings({
  branchId,
  from,
  to
}) {

  let keyCondition =
    "branchId = :branchId";


  const values = {

    ":branchId":
      branchId
  };


  if (
    from &&
    to
  ) {

    keyCondition +=
      " AND readingKey BETWEEN :from AND :to";


    values[":from"] =
      `${from}#`;


    values[":to"] =
      `${to}#\uffff`;
  }


  else if (from) {

    keyCondition +=
      " AND readingKey >= :from";


    values[":from"] =
      `${from}#`;
  }


  else if (to) {

    keyCondition +=
      " AND readingKey <= :to";


    values[":to"] =
      `${to}#\uffff`;
  }


  const result =
    await dynamo.send(
      new QueryCommand({

        TableName:
          TABLE_NAME,

        KeyConditionExpression:
          keyCondition,

        ExpressionAttributeValues:
          values,

        ScanIndexForward:
          false
      })
    );


  return result.Items ?? [];
}


// ======================================================
// SAVE READING
// ======================================================

export async function saveReading(
  item
) {

  await dynamo.send(
    new PutCommand({

      TableName:
        TABLE_NAME,

      Item:
        item
    })
  );
}


// ======================================================
// PUBLISH SNS EXCURSION
// ======================================================

export async function publishExcursion(
  message
) {

  await sns.send(
    new PublishCommand({

      TopicArn:
        EXCURSION_TOPIC_ARN,

      Message:
        JSON.stringify(
          message
        )
    })
  );
}