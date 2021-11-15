const validate = (req, validations) => {
  const errorFields = [];
  const unexpectedFields = [];
  Object.keys(req.body).forEach((field) => {
    const value = req.body[field];
    const validationFunction = validations[field];
    if (validationFunction === undefined) unexpectedFields.push(field);
    else if (!validationFunction(value)) errorFields.push(field);
  });
  return {
    hasErrors: errorFields.length !== 0 || unexpectedFields.length !== 0,
    errorFields,
    unexpectedFields,
  };
};

export default validate;
