import {
  setAlertRaisedAt
} from "../repositories/excursionRepositories.mjs";


export async function processExcursion(
  message
) {

  // ==================================================
  // DELIBERATE FAILURE FOR DLQ TEST
  // ==================================================

  if (
    message.forceFailure === true
  ) {

    console.error(
      "DELIBERATE_ALERT_FAILURE",
      {
        branchId:
          message.branchId,

        readingId:
          message.readingId
      }
    );


    throw new Error(
      "DELIBERATE_ALERT_FAILURE"
    );
  }


  if (
    !message.branchId ||
    !message.readingId
  ) {

    throw new Error(
      "Excursion message is missing branchId or readingId"
    );
  }


  if (
    message.status !== undefined &&
    message.status !== "excursion"
  ) {

    throw new Error(
      "Excursion handler received a non-excursion reading"
    );
  }


  const alertRaisedAt =
    new Date().toISOString();


  return setAlertRaisedAt({

    readingId:
      message.readingId,

    branchId:
      message.branchId,

    alertRaisedAt
  });
}