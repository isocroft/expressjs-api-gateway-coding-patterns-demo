const StorageQueryHandlersManager = require("./StorageQueryHandlersManager");

/* @NOTE: <DEPENDENCIES> | Implicit dependencies can often lead to tight coupling but not always! */

/* @HINT: This is a http service repository base class. */
class HttpServiceRepository {
  constructor(queryHandlers = []) {
    /* @NOTE: <COMPOSITION> | Composition can also lead to tight coupling! */
    /* @NOTE: Tight coupling here: will allow temporarily */
    this.queryManager = new StorageQueryHandlersManager(queryHandlers);
  }

  get httpRequest() {
    throw new Error("http request object is not available from abstract class");
  }

  set newRootHandler(rootHandler) {
    this.queryManager.swapRootHandler(rootHandler);
  }

  baseURL() {
    throw new Error("base URL string is not available from abstract class");
  }

  requestConfig(
    pathName = "/",
    httpMethod = "GET",
    headers = {},
    requestParams = {}
  ) {
    return {
      url: this.baseURL(pathName),
      method: httpMethod,
      [httpMethod === "GET" ? "query" : "body"]: requestParams,
      headers
    };
  }

  async postRequest(headers, pathName, bodyParams) {
    const httpRequest = this.httpRequest;
    httpRequest.$config = this.requestConfig(
      pathName,
      "POST",
      headers,
      bodyParams
    );

    return await this.queryManager.execute(httpRequest);
  }
}

module.exports = HttpServiceRepository;
