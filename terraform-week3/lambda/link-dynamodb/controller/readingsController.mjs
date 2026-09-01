import {
  AppError,
  createReading,
  deleteReading,
  getBranchReadings,
  getReadingById,
  patchReading
} from "../services/readingsService.mjs";


function response(statusCode, body = null) {

  if (statusCode === 204) {
    return {
      statusCode: 204,
      body: ""
    };
  }

  return {
    statusCode,

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(body)
  };
}


function parseBody(event) {

  try {

    return JSON.parse(
      event.body ?? "{}"
    );

  } catch {

    throw new AppError(
      400,
      "Request body must be valid JSON"
    );
  }
}


export async function handleRequest(
  event,
  context
) {

  console.log(
    "REST API request received",
    {
      requestId:
        context.awsRequestId,

      httpMethod:
        event.httpMethod,

      resource:
        event.resource,

      path:
        event.path,

      pathParameters:
        event.pathParameters,

      queryParameters:
        event.queryStringParameters
    }
  );


  try {

    const httpMethod =
      event.httpMethod;


    const resource =
      event.resource;


    const route =
      `${httpMethod} ${resource}`;


    const branchId =
      event.pathParameters?.branchId;


    const readingId =
      event.pathParameters?.readingId;


    switch (route) {


      // ==================================================
      // GET ALL READINGS
      // ==================================================

      case "GET /branches/{branchId}/readings": {

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
      // GET ONE READING BY readingId
      // ==================================================

      case "GET /branches/{branchId}/readings/{readingId}": {

        const reading =
          await getReadingById(
            branchId,
            readingId
          );


        return response(
          200,
          reading
        );
      }


      // ==================================================
      // CREATE READING
      // ==================================================

      case "POST /branches/{branchId}/readings": {

        const body =
          parseBody(event);


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


      // ==================================================
      // PATCH READING
      // ==================================================

      case "PATCH /branches/{branchId}/readings/{readingId}": {

        const body =
          parseBody(event);


        const updatedReading =
          await patchReading(
            branchId,
            readingId,
            body
          );


        return response(
          200,
          updatedReading
        );
      }


      // ==================================================
      // DELETE READING
      // ==================================================

      case "DELETE /branches/{branchId}/readings/{readingId}": {

        await deleteReading(
          branchId,
          readingId
        );


        return response(204);
      }


      // ==================================================
      // UNKNOWN ROUTE
      // ==================================================

      default: {

        return response(
          404,
          {
            error:
              "Route not found"
          }
        );
      }
    }


  } catch (error) {


    if (
      error instanceof AppError
    ) {

      console.warn(
        "Request rejected",
        {
          statusCode:
            error.statusCode,

          message:
            error.message
        }
      );


      return response(
        error.statusCode,
        {
          error:
            error.message
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