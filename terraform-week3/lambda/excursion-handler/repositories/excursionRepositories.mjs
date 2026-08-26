import {
  DynamoDBClient
} from "@aws-sdk/client-dynamodb";

import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";


const REGION =
  process.env.AWS_REGION;


const TABLE_NAME =
  process.env.TABLE_NAME;


const client =
  new DynamoDBClient({
    region: REGION
  });


const dynamo =
  DynamoDBDocumentClient.from(
    client
  );


// ======================================================
// SET alertRaisedAt
// ======================================================

export async function setAlertRaisedAt({
  branchId,
  readingKey,
  alertRaisedAt
}) {

  try {

    const result =
      await dynamo.send(
        new UpdateCommand({

          TableName:
            TABLE_NAME,

          Key: {

            branchId,

            readingKey
          },

          UpdateExpression:
            "SET alertRaisedAt = :alertRaisedAt",

          ConditionExpression:
            "attribute_exists(branchId) AND attribute_exists(readingKey) AND attribute_not_exists(alertRaisedAt)",

          ExpressionAttributeValues: {

            ":alertRaisedAt":
              alertRaisedAt
          },

          ReturnValues:
            "ALL_NEW"
        })
      );


    return {

      status:
        "raised",

      alertRaisedAt:
        result.Attributes
          ?.alertRaisedAt
    };


  } catch (error) {

    if (
      error.name !==
      "ConditionalCheckFailedException"
    ) {

      throw error;
    }


    // Check whether this was genuinely
    // a duplicate message.

    const current =
      await dynamo.send(
        new GetCommand({

          TableName:
            TABLE_NAME,

          Key: {

            branchId,

            readingKey
          }
        })
      );


    if (
      current.Item
        ?.alertRaisedAt
    ) {

      return {

        status:
          "duplicate",

        alertRaisedAt:
          current.Item.alertRaisedAt
      };
    }


    // Item did not exist or another unexpected
    // condition occurred. Let SQS retry it.

    throw error;
  }
}