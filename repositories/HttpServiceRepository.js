const StorageQueryHandlersManager = require("./StorageQueryHandlersManager");

/* @NOTE: <DEPENDENCIES> | Implicit dependencies can often lead to tight coupling but not always! */

/* @HINT: This is a http service repository base class. */
class HttpServiceRepository {
  constructor(queryHandlers = []) {
    /* @NOTE: <COMPOSITION> | Composition can also lead to tight coupling! */
    /* @NOTE: Tight coupling here: will allow temporarily */
    this.queryManager = new StorageQueryHandlersManager(queryHandlers);
    this.timeoutInMilliSeconds = 1500;
  }

  set newRootHandler(rootHandler) {
    this.queryManager.swapRootHandler(rootHandler);
  }

  get httpTimeout () {
    return this.timeoutInMilliSeconds
  }

  get apiVersion () {
    throw new Error("api version not set")
  }

  set httpTimeout (newHttpTimeout = 0) {
    if (typeof newHttpTimeout === "number"
        && !Number.isNaN(newHttpTimeout)) {
      this.timeoutInMilliSeconds = newHttpTimeout
    }
  }

  baseURL(pathName =  "/") {
    throw new Error(`base URL string with ${pathName} is not available from abstract class`);
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
      [httpMethod === "GET" || httpMethod === "HEAD" ? "query" : "body"]: requestParams,
      headers,
      json: headers['content-type'].includes('json'),
      form: headers['content-type'].includes('form-data')
    };
  }

  async httpPostRequest({ headers = {}, pathName = "/", requestParams = {} }) {
    const httpRequest = this.requestConfig(
      pathName,
      "POST",
      headers,
      requestParams
    );

    return this.queryManager.execute(httpRequest);
  }

  async httpGetRequest({ headers = {}, pathName = "/", requestParams = {} }) {
    const httpRequest = this.requestConfig(
      pathName,
      "GET",
      headers,
      requestParams
    );

    return this.queryManager.execute(httpRequest);
  }

  async httpPutRequest({ headers = {}, pathName = "/", requestParams = {} }) {
    const httpRequest = this.requestConfig(
      pathName,
      "PUT",
      headers,
      requestParams
    );

    return this.queryManager.execute(httpRequest);
  }

  async httpDeleteRequest({ headers = {}, pathName = "/", requestParams = {} }) {
    const httpRequest = this.requestConfig(
      pathName,
      "DELETE",
      headers,
      requestParams
    );

    return this.queryManager.execute(httpRequest);
  }
}

module.exports = HttpServiceRepository;
