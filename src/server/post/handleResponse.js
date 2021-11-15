import validate from "../validate.js";
import mutate from "../mutate.js";

const handleResponse = (req, res, next, validations, mutations) => {
  if (mutations) mutate(req, mutations);
  const { hasErrors, errorFields, unexpectedFields } = validate(
    req,
    validations
  );
  if (hasErrors) res.json({ errorFields, unexpectedFields });
  else {
    next(req, res);
  }
};

export default handleResponse;
