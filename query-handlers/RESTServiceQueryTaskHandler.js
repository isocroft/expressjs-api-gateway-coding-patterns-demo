const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");

/* @HINT: This is a rest service query task handler for a REST API server. */
class RESTServiceQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(restClient) {
    super(
      "rest service handler execution declined; either stalled connection or refused connection"
    );
    this.httpClient = restClient;
  }

  async beginProcessing(builderOrRequest) {
    let canProceedWithProcessing = false;
    let result = null;

    if (typeof builderOrRequest.url === "string" && !builderOrRequest.url.endsWith("/graphql")) {
      canProceedWithProcessing = true;
    }

    if (!canProceedWithProcessing) {
      return this.skipHandlerProcessing();
    }

    try {
      result = await this.httpClient(builderOrRequest)
      return result;
    } catch (error) {
      const HttpError = this.httpClient.HTTPError;
      const RequestError = this.httpClient.RequestError;
      const CancelError = this.httpClient.CancelError;

      if (error instanceof HttpError) {
        if (error.statusCode === "400" || error.statusCode === "404" || error.statusCode === "401") {
          return this.skipHandlerProcessingWithCustomMessage(
            `server "${error.url}" request encountered a service error; reason: ${error.statusMessage}`
          );
        }
        throw new Error(`http request to ${error.url} failed; reason: ${error.message}`)
      } else if (error instanceof RequestError) {
        if (error.code === 'ETIMEDOUT'
          || error.code === 'ECONNREFUSED'
            || error.statusCode === "500"
              || error.statusCode === "503") {
          /* @HINT: This REST API server is down, trigger the next handler to run */
          return this.skipHandlerProcessing();
        }
        throw new Error(`http request to ${error.url} failed; reason: ${error.message}`)
      } else if (error instanceof CancelError) {
        return this.skipHandlerProcessingWithCustomMessage(
          `server "${error.url}" request was cancelled`
        );
      }
    }

    
  }

  async finalizeProcessing() {
    console.log("e don finish rest service request ooo");
  }

  async finalizeProcessingWithError() {
    console.error("e don finish rest service request with error ooo");
  }
}

module.exports = RESTServiceQueryTaskHandler;
