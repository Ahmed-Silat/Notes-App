import { ApiError } from "../utils/ApiError.js";

const formatIssues = (issues) =>
  issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

/**
 * Validates request parts against zod DTO schemas and replaces them with the
 * parsed (trimmed, defaulted, unknown-keys-stripped) data.
 *
 * Usage: validate({ body: createNoteDto, params: noteIdParamDto })
 */
export const validate = (schemas) => (req, res, next) => {
  for (const [part, schema] of Object.entries(schemas)) {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errors = formatIssues(result.error.issues);
      return next(new ApiError(400, errors[0].message, errors));
    }

    // defineProperty so this also works for Express 5's getter-only req.query
    Object.defineProperty(req, part, {
      value: result.data,
      writable: true,
      enumerable: true,
      configurable: true,
    });
  }

  next();
};
