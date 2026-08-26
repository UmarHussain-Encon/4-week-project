import { handleRequest } from "./controller/readingsController.mjs";

export const handler = async (event, context) => {
  return handleRequest(event, context);
};