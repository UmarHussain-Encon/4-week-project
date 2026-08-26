import {
  AppError,
  createReading,
  getBranchReadings,
  getReadingByTimestamp
} from "../services/readingsService.mjs";


function response(statusCode, body) {
  return {
    statusCode,

    headers: {
      "content-type": "application/json"
    },

    body: JSON.stringify(body)
  };
}


export async function handleRequest(event, context) {

  console.log("API request received", {
    requestId: context.awsRequestId,
    routeKey: event.routeKey,
    pathParameters: event.pathParameters,
    queryParameters: event.queryStringParameters
  });


  try {

    const route = event.routeKey;

    const branchId =
      event.pathParameters?.branchId;


    // ==================================================
    // GET ALL READINGS FOR A BRANCH
    // ==================================================

    if (
      route ===
      "GET /branches/{branchId}/readings"
    ) {

      const from =
        event.queryStringParameters?.from;

      const to =
        event.queryStringParameters?.to;


      const readings =
        await getBranchReadings({
          branchId,
          from,
          to
        });


      return response(
        200,
        readings
      );
    }


    // ==================================================
    // GET ONE READING
    // ==================================================

    if (
      route ===
      "GET /branches/{branchId}/readings/{recordedAt}"
    ) {

      const recordedAt =
        event.pathParameters?.recordedAt;


      const reading =
        await getReadingByTimestamp(
          branchId,
          recordedAt
        );


      return response(
        200,
        reading
      );
    }


    // ==================================================
    // CREATE READING
    // ==================================================

    if (
      route ===
      "POST /branches/{branchId}/readings"
    ) {

      let body;


      try {

        body =
          JSON.parse(
            event.body ?? "{}"
          );

      } catch {

        throw new AppError(
          400,
          "Request body must be valid JSON"
        );
      }


      const reading =
        await createReading(
          branchId,
          body
        );


      return response(
        201,
        reading
      );
    }


    return response(404, {
      error: "Route not found"
    });


  } catch (error) {

    if (error instanceof AppError) {

      console.warn(
        "Request rejected",
        {
          statusCode: error.statusCode,
          message: error.message
        }
      );


      return response(
        error.statusCode,
        {
          error: error.message
        }
      );
    }


    console.error(
      "Unhandled API error",
      error
    );


    return response(
      500,
      {
        error:
          "Internal server error"
      }
    );
  }
}