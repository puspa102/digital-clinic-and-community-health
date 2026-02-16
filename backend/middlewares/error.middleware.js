/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent JSON responses
 */

/**
 * Custom API Error class for structured error handling
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

/**
 * Bad Request Error - 400
 */
export class BadRequestError extends ApiError {
  constructor(message = "Bad request", errors = []) {
    super(400, message, errors);
  }
}

/**
 * Unauthorized Error - 401
 */
export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized access") {
    super(401, message);
  }
}

/**
 * Forbidden Error - 403
 */
export class ForbiddenError extends ApiError {
  constructor(message = "Access forbidden") {
    super(403, message);
  }
}

/**
 * Conflict Error - 409
 */
export class ConflictError extends ApiError {
  constructor(message = "Resource already exists") {
    super(409, message);
  }
}

/**
 * Validation Error - 422
 */
export class ValidationError extends ApiError {
  constructor(message = "Validation failed", errors = []) {
    super(422, message, errors);
  }
}

/**
 * Internal Server Error - 500
 */
export class InternalError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message, [], false);
  }
}

/**
 * Handle Sequelize validation errors
 */
const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path,
    message: e.message,
    type: e.type,
  }));
  return new ValidationError("Database validation failed", errors);
};

/**
 * Handle Sequelize unique constraint errors
 */
const handleSequelizeUniqueConstraintError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path,
    message: `${e.path} already exists`,
    value: e.value,
  }));
  return new ConflictError("Duplicate entry detected");
};

/**
 * Handle Sequelize foreign key constraint errors
 */
const handleSequelizeForeignKeyError = (err) => {
  return new BadRequestError("Referenced resource does not exist");
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => {
  return new UnauthorizedError("Invalid token. Please log in again");
};

/**
 * Handle JWT expired errors
 */
const handleJWTExpiredError = () => {
  return new UnauthorizedError("Token expired. Please log in again");
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    errors: err.errors,
    stack: err.stack,
    error: err,
  });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors.length > 0 ? err.errors : undefined,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error("ERROR 💥:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  const isDev = process.env.NODE_ENV === "development";

  // Clone error for modification
  let error = { ...err, message: err.message, stack: err.stack };

  // Handle Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    error = handleSequelizeValidationError(err);
  }

  // Handle Sequelize unique constraint errors
  if (err.name === "SequelizeUniqueConstraintError") {
    error = handleSequelizeUniqueConstraintError(err);
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === "SequelizeForeignKeyConstraintError") {
    error = handleSequelizeForeignKeyError(err);
  }

  // Handle JWT invalid token error
  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  // Handle JWT expired token error
  if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  // Handle syntax errors in JSON body
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    error = new BadRequestError("Invalid JSON in request body");
  }

  // Ensure error has required properties
  error.statusCode = error.statusCode || err.statusCode || 500;
  error.isOperational = error.isOperational !== undefined ? error.isOperational : true;
  error.errors = error.errors || [];

  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Async handler wrapper to catch async errors
 * Wraps async route handlers to automatically catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

export default errorHandler;
