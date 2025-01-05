const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");
const url = require('url');

const { camelCaseify } = require("../helpers");

/* @HINT: This is a graphql service query task handler for a GraphQL API server. */
class GraphQLServiceQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(graphQlClient) {
    super("graphql service handler execution declined");
    this.httpClient = graphQlClient;

    this.pathname = "/graphql"
    this.operationNamesMap = { '_': [] }
  }

  set updateGraphQlServicePathname (newPathname = "/") {
    this.pathname = newPathname
  }

  set updateGraphQlOperationNameToFieldsMap (newOperationNamesMap) {
    this.operationNamesMap = newOperationNamesMap
  }

  get graphQlServicePathname () {
    return this.pathname
  }

  get graphQlOperationNameToFieldsMap () {
    return this.operationNamesMap
  }

  async beginProcessing(builderOrRequest) {
    let result = null
    let canProceedWithProcessing = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder instance */
    if (builderOrRequest instanceof Object
      && typeof builderOrRequest.url === "string"
        && builderOrRequest.url.endsWith(this.graphQlServicePathname)) {
      canProceedWithProcessing = true;
    }

    if (!canProceedWithProcessing) {
      return this.skipHandlerProcessing();
    }

    const url = builderOrRequest.url
    const type = builderOrRequest.type
    const query = builderOrRequest[type]

    delete builderOrRequest.url
    delete builderOrRequest.type
    delete builderOrRequest[type]
 
    try {
      result = await this.graphQlClient[type](url, query, builderOrRequest)
      return result
    } catch (error) {
      /* @HINT: re-throw the error using `error.message` */
      this.skipHandlerProcessingWithCustomMessage(error.message)
    }
  }

  migrateContext (builderOrRequest) {
    let type =  "query"
    let operationName = "_"

    if (builderOrRequest['query'] instanceof Object
      || builderOrRequest['mutation'] instanceof Object) {
      return builderOrRequest;
    }

    /* @HINT: transform request object meant for a rest service to a graph ql service payload object */
    if (typeof builderOrRequest.url === "string"
      && !builderOrRequest.url.endsWith(this.graphQlServicePathname)) {
      const { host, pathname } =  typeof url['parse'] === "function"
      ? url.parse(uri)
      : new url.URL(uri);

      operationName = camelCaseify(pathname)
      builderOrRequest.url = `${host}${this.graphQlServicePathname}`;
    }

    if (typeof builderOrRequest.method === "string"
      && builderOrRequest.method !== "POST") {
      type = builderOrRequest.method === "GET" || builderOrRequest.method === "GET"
      ? "query"
      : "mutation"

      delete builderOrRequest.method;
    }

    /* @TODO: add `variable` and `args` to `operation` object the JSON-query object for proper GraphQL types */
    builderOrRequest[type] = {
      operation: {
        name: operationName,
        fields: this.graphQlOperationToFieldsNameMap[operationName]
      }
    }

    builderOrRequest.useHttp2 = true
    builderOrRequest.type = type

    delete builderOrRequest.body
    delete builderOrRequest.query
    delete builderOrRequest.form
    delete builderOrRequest.timeout

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
