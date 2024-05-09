const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");

/* @HINT: This is a rest service query task handler for a REST API server. */
class RESTServiceQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(restClient) {
    super("rest service handler execution declined");
    this.httpClient = restClient;
  }

  async beginProcessing(builderOrRequest) {
    let canProceedWithProcessing = false;

    if (typeof builderOrRequest.url === "string" && !builderOrRequest.url.endsWith("/graphql")) {
      canProceedWithProcessing = true;
    }

    /* @TODO:  Write code to make rest request to rest api server endpoint */

    this.skipHandlerProcessing();
  }

  async finalizeProcessing() {
    console.log("e don finish rest service request ooo");
  }

  async finalizeProcessingWithError() {
    console.error("e don finish rest service request with error ooo");
  }
}

module.exports = RESTServiceQueryTaskHandler;
