import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

// Middleware to handle validation
export const validate = (validations: ValidationChain[]): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Run all validations
      await Promise.all(validations.map((validation) => validation.run(req)));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          message: 'Validation failed',
          errors: errors.array(),
          error: true,
        });
        return;
      }

      // Proceed to next middleware
      next();
    } catch (err) {
      next(err);
    }
  };
};
