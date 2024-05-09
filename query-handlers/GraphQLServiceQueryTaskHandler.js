const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");
const url = require('url');

/* @HINT: This is a graphql service query task handler for a GraphQL API server. */
class GraphQLServiceQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(graphQlClient) {
    super("graphql service handler execution declined");
    this.httpClient = graphQlClient;
  }
  async beginProcessing(builderOrRequest) {
    let canProceedWithProcessing = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder instance */
    if (typeof builderOrRequest.url === "string" && builderOrRequest.url.endsWith("/graphql")) {
      canProceedWithProcessing = true;
    }

    /* @TODO:  Write code to make rest request to graphql api server endpoint */

    this.skipHandlerProcessing();
  }

  migrateContext (builderOrRequest) {
    /* @HINT: transform request object meant for a rest service to a graph ql service payload object. */
    if (typeof builderOrRequest.url === "string" && !builderOrRequest.url.endsWith("/graphql")) {
      const { host } =  typeof url['parse'] === "function"
      ? url.parse(uri)
      : new url.URL(uri);

      builderOrRequest.url = `${host}/graphql`;
    }

    if (typeof builderOrRequest.method === "string" && builderOrRequest.method !== "POST") {
      builderOrRequest.method = "POST"
    }

    return builderOrRequest
  }

  async finalizeProcessing() {
    console.log("e don finish graphql service request ooo");
  }

  async finalizeProcessingWithError() {
    console.error("e don finish graphql service request with error ooo");
  }
}

module.exports = GraphQLServiceQueryTaskHandler;
