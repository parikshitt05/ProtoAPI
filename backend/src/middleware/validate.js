const { ZodError } = require("zod");

// Generic Zod validation middleware factory
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body); // also strips unknown fields
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }
    next(err);
  }
};

module.exports = validate;
