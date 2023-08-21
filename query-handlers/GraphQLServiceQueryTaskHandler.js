const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");

/* @HINT: This is a graphql service query task handler for a GraphQL API server. */
class GraphQLServiceQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(httpContainer) {
    super("graphql service handler execution declined");
    this.http = httpContainer;
  }
  async beginProcessing() {
    /* @TODO:  Write code to make graphql request to graphql api server endpoint */

    this.skipHandlerProcessing();
  }

  async finalizeProcessing() {
    console.log("e don finish graphql service request ooo");
  }
}

module.exports = GraphQLServiceQueryTaskHandler;
