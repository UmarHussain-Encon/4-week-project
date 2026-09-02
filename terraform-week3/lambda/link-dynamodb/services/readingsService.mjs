import { randomUUID } from "node:crypto";

import {
  deleteReadingFromDatabase,
  findReadingById,
  publishExcursion,
  queryBranchReadings,
  saveReading,
  updateReading
} from "../repositories/readingsRepositories.mjs";


// ======================================================
// APP ERROR
// ======================================================

export class AppError extends Error {

  constructor(
    statusCode,
    message
  ) {

    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
  }
}


// ======================================================
// VALIDATE BODY
// ======================================================

function validateBodyObject(body) {

  if (
    body === null ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {

    throw new AppError(
      400,
      "Request body must be a JSON object"
    );
  }
}


// ======================================================
// UUID VERSION 4 VALIDATION
//
// Used for GET one, PATCH and DELETE.
// It does NOT create a UUID.
// ======================================================

function normaliseUuidV4(value) {

  if (
    typeof value !== "string"
  ) {

    return null;
  }


  const readingId =
    value
      .trim()
      .toLowerCase();


  const uuidV4Pattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;


  if (
    !uuidV4Pattern.test(
      readingId
    )
  ) {

    return null;
  }


  return readingId;
}


// ======================================================
// DATE NORMALISATION
// ======================================================

function normaliseDate(value) {

  if (!value) {

    return null;
  }


  let decodedValue;


  try {

    decodedValue =
      decodeURIComponent(
        value
      );

  } catch {

    decodedValue =
      value;
  }


  const timestamp =
    Date.parse(
      decodedValue
    );


  if (
    Number.isNaN(
      timestamp
    )
  ) {

    return null;
  }


  return new Date(
    timestamp
  ).toISOString();
}


// ======================================================
// STATUS BUSINESS RULE
// ======================================================

function getReadingStatus(
  minTempC,
  maxTempC
) {

  if (
    !Number.isFinite(minTempC) ||
    !Number.isFinite(maxTempC)
  ) {

    throw new AppError(
      400,
      "minTempC and maxTempC must be numbers"
    );
  }


  if (
    minTempC < 2 ||
    maxTempC > 8
  ) {

    return "excursion";
  }


  return "ok";
}


// ======================================================
// GET ALL READINGS
// ======================================================

export async function getBranchReadings({
  branchId,
  from,
  to
}) {

  if (!branchId) {

    throw new AppError(
      400,
      "branchId is required"
    );
  }


  let normalisedFrom =
    null;


  let normalisedTo =
    null;


  if (from) {

    normalisedFrom =
      normaliseDate(
        from
      );


    if (!normalisedFrom) {

      throw new AppError(
        400,
        "from must be a valid date"
      );
    }
  }


  if (to) {

    normalisedTo =
      normaliseDate(
        to
      );


    if (!normalisedTo) {

      throw new AppError(
        400,
        "to must be a valid date"
      );
    }
  }


  if (
    normalisedFrom &&
    normalisedTo &&
    new Date(normalisedFrom) >
      new Date(normalisedTo)
  ) {

    throw new AppError(
      400,
      "from must be before to"
    );
  }


  return queryBranchReadings({
    branchId,
    from: normalisedFrom,
    to: normalisedTo
  });
}


// ======================================================
// GET ONE READING
// ======================================================

export async function getReadingById(
  branchId,
  readingIdValue
) {

  const readingId =
    normaliseUuidV4(
      readingIdValue
    );


  if (!readingId) {

    throw new AppError(
      400,
      "readingId must be a valid UUIDv4"
    );
  }


  const reading =
    await findReadingById(
      readingId
    );


  if (
    !reading ||
    reading.branchId !== branchId
  ) {

    throw new AppError(
      404,
      "Reading not found"
    );
  }


  return reading;
}


// ======================================================
// CREATE READING
// ======================================================

export async function createReading(
  branchId,
  body
) {

  validateBodyObject(
    body
  );


  if (!branchId) {

    throw new AppError(
      400,
      "branchId is required"
    );
  }


  // ==================================================
  // CLIENT MUST NOT PROVIDE readingId
  //
  // The server automatically creates a UUIDv4.
  // ==================================================

  if (
    body.readingId !== undefined
  ) {

    throw new AppError(
      400,
      "readingId is generated automatically and must not be supplied"
    );
  }


  const requiredFields = [
    "recordedAt",
    "minTempC",
    "maxTempC",
    "recordedBy"
  ];


  for (
    const field of requiredFields
  ) {

    if (
      body[field] === undefined ||
      body[field] === null ||
      body[field] === ""
    ) {

      throw new AppError(
        400,
        `Missing required field: ${field}`
      );
    }
  }


  // ==================================================
  // PREVENT SERVER-MANAGED FIELDS
  // ==================================================

  if (
    body.status !== undefined ||
    body.alertRaisedAt !== undefined ||
    body.branchId !== undefined
  ) {

    throw new AppError(
      400,
      "Server-managed fields must not be supplied"
    );
  }


  // ==================================================
  // TEMPERATURE VALIDATION
  // ==================================================

  if (
    !Number.isFinite(
      body.minTempC
    ) ||
    !Number.isFinite(
      body.maxTempC
    )
  ) {

    throw new AppError(
      400,
      "minTempC and maxTempC must be numbers"
    );
  }


  if (
    body.maxTempC <
    body.minTempC
  ) {

    throw new AppError(
      400,
      "maxTempC must be greater than or equal to minTempC"
    );
  }


  // ==================================================
  // RECORDED BY VALIDATION
  // ==================================================

  if (
    typeof body.recordedBy !== "string" ||
    body.recordedBy.trim() === ""
  ) {

    throw new AppError(
      400,
      "recordedBy must be a non-empty string"
    );
  }


  // ==================================================
  // DATE VALIDATION
  // ==================================================

  const recordedAt =
    normaliseDate(
      body.recordedAt
    );


  if (!recordedAt) {

    throw new AppError(
      400,
      "recordedAt must be a valid date"
    );
  }


  if (
    new Date(
      recordedAt
    ).getTime() >
    Date.now()
  ) {

    throw new AppError(
      400,
      "recordedAt cannot be in the future"
    );
  }


  // ==================================================
  // CALCULATE READING STATUS
  // ==================================================

  const status =
    getReadingStatus(
      body.minTempC,
      body.maxTempC
    );


  // ==================================================
  // GENERATE UUIDv4 AUTOMATICALLY
  //
  // randomUUID() generates UUID VERSION 4.
  // ==================================================

  const readingId =
    randomUUID();


  // ==================================================
  // BUILD DYNAMODB ITEM
  // ==================================================

  const item = {

    readingId,

    branchId,

    recordedAt,

    minTempC:
      body.minTempC,

    maxTempC:
      body.maxTempC,

    recordedBy:
      body.recordedBy.trim(),

    status
  };


  // ==================================================
  // SAVE READING
  // ==================================================

  try {

    await saveReading(
      item
    );

  } catch (error) {

    if (
      error.name ===
      "ConditionalCheckFailedException"
    ) {

      throw new AppError(
        409,
        "A reading already exists with this readingId"
      );
    }


    throw error;
  }


  console.log(
    "Reading saved",
    {
      branchId,
      readingId,
      recordedAt,
      status
    }
  );


  // ==================================================
  // PUBLISH EXCURSION
  // ==================================================

  if (
    status === "excursion"
  ) {

    await publishExcursion({

      branchId,

      readingId,

      recordedAt,

      minTempC:
        body.minTempC,

      maxTempC:
        body.maxTempC,

      status
    });


    console.log(
      "Excursion published",
      {
        branchId,
        readingId
      }
    );
  }


  return item;
}


// ======================================================
// PATCH READING
// ======================================================

export async function patchReading(
  branchId,
  readingIdValue,
  body
) {

  validateBodyObject(
    body
  );


  const readingId =
    normaliseUuidV4(
      readingIdValue
    );


  if (!readingId) {

    throw new AppError(
      400,
      "readingId must be a valid UUIDv4"
    );
  }


  const suppliedFields =
    Object.keys(
      body
    );


  if (
    suppliedFields.length === 0
  ) {

    throw new AppError(
      400,
      "At least one field must be supplied"
    );
  }


  // ==================================================
  // ONLY THESE FIELDS MAY BE PATCHED
  // ==================================================

  const allowedFields =
    new Set([
      "minTempC",
      "maxTempC",
      "recordedBy"
    ]);


  for (
    const field of suppliedFields
  ) {

    if (
      !allowedFields.has(
        field
      )
    ) {

      throw new AppError(
        400,
        `Field cannot be updated: ${field}`
      );
    }
  }


  const existing =
    await findReadingById(
      readingId
    );


  if (
    !existing ||
    existing.branchId !== branchId
  ) {

    throw new AppError(
      404,
      "Reading not found"
    );
  }


  const minTempC =
    body.minTempC !== undefined
      ? body.minTempC
      : existing.minTempC;


  const maxTempC =
    body.maxTempC !== undefined
      ? body.maxTempC
      : existing.maxTempC;


  const recordedBy =
    body.recordedBy !== undefined
      ? body.recordedBy
      : existing.recordedBy;


  // ==================================================
  // VALIDATE UPDATED VALUES
  // ==================================================

  if (
    !Number.isFinite(
      minTempC
    ) ||
    !Number.isFinite(
      maxTempC
    )
  ) {

    throw new AppError(
      400,
      "minTempC and maxTempC must be numbers"
    );
  }


  if (
    maxTempC <
    minTempC
  ) {

    throw new AppError(
      400,
      "maxTempC must be greater than or equal to minTempC"
    );
  }


  if (
    typeof recordedBy !== "string" ||
    recordedBy.trim() === ""
  ) {

    throw new AppError(
      400,
      "recordedBy must be a non-empty string"
    );
  }


  // ==================================================
  // RECALCULATE STATUS
  // ==================================================

  const status =
    getReadingStatus(
      minTempC,
      maxTempC
    );


  let updatedReading;


  try {

    updatedReading =
      await updateReading({

        readingId,

        minTempC,

        maxTempC,

        recordedBy:
          recordedBy.trim(),

        status
      });

  } catch (error) {

    if (
      error.name ===
      "ConditionalCheckFailedException"
    ) {

      throw new AppError(
        404,
        "Reading not found"
      );
    }


    throw error;
  }


  // ==================================================
  // IF READING BECAME AN EXCURSION,
  // PUBLISH AN ALERT
  // ==================================================

  if (
    existing.status !== "excursion" &&
    status === "excursion"
  ) {

    await publishExcursion({

      branchId,

      readingId,

      recordedAt:
        existing.recordedAt,

      minTempC,

      maxTempC,

      status
    });
  }


  return updatedReading;
}


// ======================================================
// DELETE READING
// ======================================================

export async function deleteReading(
  branchId,
  readingIdValue
) {

  const readingId =
    normaliseUuidV4(
      readingIdValue
    );


  if (!readingId) {

    throw new AppError(
      400,
      "readingId must be a valid UUIDv4"
    );
  }


  const existing =
    await findReadingById(
      readingId
    );


  if (
    !existing ||
    existing.branchId !== branchId
  ) {

    throw new AppError(
      404,
      "Reading not found"
    );
  }


  try {

    await deleteReadingFromDatabase(
      readingId
    );

  } catch (error) {

    if (
      error.name ===
      "ConditionalCheckFailedException"
    ) {

      throw new AppError(
        404,
        "Reading not found"
      );
    }


    throw error;
  }


  console.log(
    "Reading deleted",
    {
      branchId,
      readingId
    }
  );
}