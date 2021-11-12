const ServerErrors = Object.freeze({
  FORBIDDEN: "You do not have permission to access this page",
  INTERNAL_SERVER_ERROR:
    "Internal server error. Please contact your system administrator for assistance",
  UNKNOWN: "Unknown error",
});

const getServerErrorText = (statusCode) => {
  switch (statusCode) {
    case 403:
      return ServerErrors.FORBIDDEN;
    case 500:
      return ServerErrors.INTERNAL_SERVER_ERROR;
    default:
      return ServerErrors.UNKNOWN;
  }
};

export default getServerErrorText;
