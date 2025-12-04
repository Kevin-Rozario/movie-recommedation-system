import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError.util.js";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  console.error(err);

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON payload. Please check your request body format.";
  }

  // Send the standardized error response
  res.status(statusCode).json({
    success: false,
    statusCode: statusCode,
    message: message,
  });
};

export default errorMiddleware;
