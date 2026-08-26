import { randomUUID } from "node:crypto";

import {
  findReadingByTimestamp,
  queryBranchReadings,
  saveReading,
  publishExcursion
} from "../repositories/readingsRepositories.mjs";


export class AppError extends Error {

  constructor(statusCode, message) {

    super(message);

    this.name =
      "AppError";

    this.statusCode =
      statusCode;
  }
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
      decodeURIComponent(value);

  } catch {

    decodedValue =
      value;
  }


  const timestamp =
    Date.parse(decodedValue);


  if (
    Number.isNaN(timestamp)
  ) {
    return null;
  }


  return new Date(
    timestamp
  ).toISOString();
}


// ======================================================
// TEMPERATURE BUSINESS RULE
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


  let normalisedFrom = null;
  let normalisedTo = null;


  if (from) {

    normalisedFrom =
      normaliseDate(from);


    if (!normalisedFrom) {

      throw new AppError(
        400,
        "from must be a valid date"
      );
    }
  }


  if (to) {

    normalisedTo =
      normaliseDate(to);


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

export async function getReadingByTimestamp(
  branchId,
  recordedAtValue
) {

  if (!branchId) {

    throw new AppError(
      400,
      "branchId is required"
    );
  }


  const recordedAt =
    normaliseDate(
      recordedAtValue
    );


  if (!recordedAt) {

    throw new AppError(
      400,
      "recordedAt must be a valid date"
    );
  }


  const reading =
    await findReadingByTimestamp(
      branchId,
      recordedAt
    );


  if (!reading) {

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

  if (!branchId) {

    throw new AppError(
      400,
      "branchId is required"
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


  if (
    !Number.isFinite(body.minTempC) ||
    !Number.isFinite(body.maxTempC)
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


  if (
    body.status !== undefined
  ) {

    throw new AppError(
      400,
      "status is calculated by the server and must not be supplied"
    );
  }


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
    new Date(recordedAt).getTime() >
    Date.now()
  ) {

    throw new AppError(
      400,
      "recordedAt cannot be in the future"
    );
  }


  const existing =
    await findReadingByTimestamp(
      branchId,
      recordedAt
    );


  if (existing) {

    throw new AppError(
      409,
      "A reading already exists for this branch and timestamp"
    );
  }


  const status =
    getReadingStatus(
      body.minTempC,
      body.maxTempC
    );


  const readingId =
    randomUUID();


  const readingKey =
    `${recordedAt}#${readingId}`;


  const item = {

    branchId,

    readingKey,

    readingId,

    recordedAt,

    minTempC:
      body.minTempC,

    maxTempC:
      body.maxTempC,

    recordedBy:
      body.recordedBy,

    status
  };


  await saveReading(item);


  console.log(
    "Reading saved",
    {
      branchId,
      readingId,
      status
    }
  );


  // ==================================================
  // PUBLISH EXCURSION EVENT
  // ==================================================

  if (
    status === "excursion"
  ) {

    await publishExcursion({

      branchId,

      readingKey,

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