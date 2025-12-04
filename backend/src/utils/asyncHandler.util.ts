import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous Express route handler to catch any errors and pass them to the `next` middleware.
 * This avoids the need for repetitive try-catch blocks in every controller.
 * @param fn The asynchronous route handler function.
 * @returns A new RequestHandler function with error handling.
 */
export const asyncHandler = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
