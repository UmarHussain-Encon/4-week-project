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
  readingId,
  branchId,
  alertRaisedAt
}) {

  try {

    const result =
      await dynamo.send(
        new UpdateCommand({

          TableName:
            TABLE_NAME,

          Key: {
            readingId
          },

          UpdateExpression:
            "SET alertRaisedAt = :alertRaisedAt",

          ConditionExpression:
            "attribute_exists(readingId) AND branchId = :branchId AND attribute_not_exists(alertRaisedAt)",

          ExpressionAttributeValues: {

            ":branchId":
              branchId,

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


    const current =
      await dynamo.send(
        new GetCommand({

          TableName:
            TABLE_NAME,

          Key: {
            readingId
          }
        })
      );


    if (
      current.Item &&
      current.Item.branchId === branchId &&
      current.Item.alertRaisedAt
    ) {

      return {

        status:
          "duplicate",

        alertRaisedAt:
          current.Item.alertRaisedAt
      };
    }


    throw error;
  }
}