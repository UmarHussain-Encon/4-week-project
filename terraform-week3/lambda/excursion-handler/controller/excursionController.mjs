import {
  processExcursion
} from "../services/excursionServices.mjs";


export async function handleExcursionBatch(
  event,
  context
) {

  console.log(
    "Excursion batch received",
    {
      requestId:
        context.awsRequestId,

      messageCount:
        event.Records?.length ?? 0
    }
  );


  for (
    const record of
    event.Records ?? []
  ) {

    let message;


    try {

      message =
        JSON.parse(
          record.body
        );

    } catch (error) {

      console.error(
        "Invalid SQS message",
        {
          messageId:
            record.messageId
        }
      );


      throw error;
    }


    console.log(
      "Processing excursion",
      {
        messageId:
          record.messageId,

        branchId:
          message.branchId,

        readingId:
          message.readingId
      }
    );


    const result =
      await processExcursion(
        message
      );


    switch (result.status) {

      // ==================================================
      // DUPLICATE MESSAGE
      // ==================================================

      case "duplicate": {

        console.log(
          "Duplicate message ignored - alert already raised",
          {
            branchId:
              message.branchId,

            readingId:
              message.readingId,

            alertRaisedAt:
              result.alertRaisedAt
          }
        );


        break;
      }


      // ==================================================
      // ALERT SUCCESSFULLY RAISED
      // ==================================================

      case "raised": {

        console.log(
          "ALERT RAISED",
          {
            branchId:
              message.branchId,

            readingId:
              message.readingId,

            recordedAt:
              message.recordedAt,

            alertRaisedAt:
              result.alertRaisedAt
          }
        );


        break;
      }


      // ==================================================
      // UNEXPECTED RESULT
      // ==================================================

      default: {

        console.warn(
          "Unexpected excursion result",
          {
            branchId:
              message.branchId,

            readingId:
              message.readingId,

            resultStatus:
              result.status
          }
        );


        break;
      }
    }
  }


  return {
    processed:
      event.Records?.length ?? 0
  };
}