const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");

/* @HINT: This is a rest service query task handler for a REST API server. */
class RESTServiceQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(httpContainer) {
    super("rest service handler execution declined");
    this.http = httpContainer;
  }
  async beginProcessing() {
    /* @TODO:  Write code to make rest request to rest api server endpoint */

    this.skipHandlerProcessing();
  }

  async finalizeProcessing() {
    console.log("e don finish rest service request ooo");
  }
}

module.exports = RESTServiceQueryTaskHandler;
