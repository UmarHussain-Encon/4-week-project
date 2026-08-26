import {
  handleExcursionBatch
} from "./controller/excursionController.mjs";


export const handler =
  async (event, context) => {

    return handleExcursionBatch(
      event,
      context
    );
  };