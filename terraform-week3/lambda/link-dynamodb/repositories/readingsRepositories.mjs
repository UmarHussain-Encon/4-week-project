import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";

import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import {
  PublishCommand,
  SNSClient
} from "@aws-sdk/client-sns";


const REGION =
  process.env.AWS_REGION;


const TABLE_NAME =
  process.env.TABLE_NAME;


const BRANCH_RECORDED_AT_INDEX =
  process.env.BRANCH_RECORDED_AT_INDEX;


const EXCURSION_TOPIC_ARN =
  process.env.EXCURSION_TOPIC_ARN;


// ======================================================
// DYNAMODB
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
// SNS
// ======================================================

const sns =
  new SNSClient({
    region: REGION
  });


// ======================================================
// FIND ONE READING BY UNIQUE readingId
// ======================================================

export async function findReadingById(
  readingId
) {

  const result =
    await dynamo.send(
      new GetCommand({

        TableName:
          TABLE_NAME,

        Key: {
          readingId
        }
      })
    );


  return result.Item;
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
    ":branchId": branchId
  };


  if (
    from &&
    to
  ) {

    keyCondition +=
      " AND recordedAt BETWEEN :from AND :to";


    values[":from"] =
      from;


    values[":to"] =
      to;
  }


  else if (from) {

    keyCondition +=
      " AND recordedAt >= :from";


    values[":from"] =
      from;
  }


  else if (to) {

    keyCondition +=
      " AND recordedAt <= :to";


    values[":to"] =
      to;
  }


  const result =
    await dynamo.send(
      new QueryCommand({

        TableName:
          TABLE_NAME,

        IndexName:
          BRANCH_RECORDED_AT_INDEX,

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
//
// This condition makes readingId unique atomically.
// ======================================================

export async function saveReading(
  item
) {

  await dynamo.send(
    new PutCommand({

      TableName:
        TABLE_NAME,

      Item:
        item,

      ConditionExpression:
        "attribute_not_exists(readingId)"
    })
  );
}


// ======================================================
// UPDATE READING
// ======================================================

export async function updateReading({
  readingId,
  minTempC,
  maxTempC,
  recordedBy,
  status
}) {

  const result =
    await dynamo.send(
      new UpdateCommand({

        TableName:
          TABLE_NAME,

        Key: {
          readingId
        },

        UpdateExpression:
          "SET #minTempC = :minTempC, #maxTempC = :maxTempC, #recordedBy = :recordedBy, #status = :status",

        ConditionExpression:
          "attribute_exists(readingId)",

        ExpressionAttributeNames: {

          "#minTempC":
            "minTempC",

          "#maxTempC":
            "maxTempC",

          "#recordedBy":
            "recordedBy",

          "#status":
            "status"
        },

        ExpressionAttributeValues: {

          ":minTempC":
            minTempC,

          ":maxTempC":
            maxTempC,

          ":recordedBy":
            recordedBy,

          ":status":
            status
        },

        ReturnValues:
          "ALL_NEW"
      })
    );


  return result.Attributes;
}


// ======================================================
// DELETE READING
// ======================================================

export async function deleteReadingFromDatabase(
  readingId
) {

  const result =
    await dynamo.send(
      new DeleteCommand({

        TableName:
          TABLE_NAME,

        Key: {
          readingId
        },

        ConditionExpression:
          "attribute_exists(readingId)",

        ReturnValues:
          "ALL_OLD"
      })
    );


  return result.Attributes;
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