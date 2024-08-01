class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};

const invalidUrlHandler = (req, res, next) => {
  next(new AppError(`Invalid URL: ${req.originalUrl} not found`, 404));
};

const globalErrorHandler = (err, req, res, next) => {
  const { message, statusCode } = err;
  res.status(statusCode || 500).json({ message, stack: err.stack });
};

export { AppError, asyncErrorHandler, invalidUrlHandler, globalErrorHandler };
