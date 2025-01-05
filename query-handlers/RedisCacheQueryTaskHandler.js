const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");
const { murmurHash } = require("../helpers");
/* @NOTE: <OPEN/CLOSE PRINCIPLE> | The way the code for this class is written, it's totally closed for modification! */

/* @NOTE: To change the behaviour of this class, you have to swap it's input */

/* @HINT: This is a cache query task handler for the Redis cache. */

class RedisCacheQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(cacheContainer) {
    super("cache handler execution declined");
    cacheContainer.on("error", (error) => {
      throw new Error(error);
    });
    this.cache = cacheContainer;
  }

  async canQuery (queryKey) {
    return this.cache.hasKey(queryKey);
  }

  async beginProcessing (builderOrRequest) {
    let canProceedWithProcessing = false;
    let isSQLDatabaseQueryTask = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder object */
    if (typeof builderOrRequest.toSQL === "function") {
      /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
      const query = builderOrRequest.toSQL();
      canProceedWithProcessing = query.sql.toLowerCase().startsWith("select")
        && !query.sql.toLowerCase().includes("join");
      isSQLDatabaseQueryTask = true
    } 
    /* @HINT: Check if the variable `builderOrRequest` is a http (graphql) request config object */
    else if (typeof builderOrRequest.url === "string"
      && !builderOrRequest.url.endsWith("/graphql")) {
      const hasHeaders = builderOrRequest.headers instanceof Object;
      const headers = builderOrRequest.headers; 
      const method = builderOrRequest.method.toLowerCase();
      
      /*  @HINT: This redis cache query task handler will not handle graphql query tasks */
      canProceedWithProcessing = !(hasHeaders
        && headers['content-type'] === "application/graphql")
        || !(method === "post"
            && typeof builderOrRequest.body === "string"
              && headers['content-type'] === "application/json"
              && /([\s]*){([\s]*)"([\s]*)query([\s]*)"([\s]*)\:([\s]*)"([\s]*){/m.test(
                builderOrRequest.body.toLowerCase()
              )
           ) || !(method === "get"
                  && typeof builderOrRequest.query === "string"
                    && builderOrRequest.query.includes("query={")
                );
    }

    if (!canProceedWithProcessing) {
      return this.skipHandlerProcessing();
    }

    await this.cache.establishConnectionWithRedisServer({
      timeoutInMilliSeconds: 1200
    });

    const queryHash = murmurHash(
      isSQLDatabaseQueryTask
        ? builderOrRequest.toSQL().sql
        : `${builderOrRequest.method.toLowerCase()}-${builderOrRequest.url}`
    );
    const isCacheHit = await this.canQuery(queryHash);

    if (isCacheHit) {
      return await this.cache.get(queryHash);
    }

    return this.skipHandlerProcessing();
  }

  async finalizeProcessing(builderOrRequest, result) {
    let canProceedWithProcessing = false;
    let isSQLDatabaseQueryTask = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder object */
    if (typeof builderOrRequest.toSQL === "function") {
      /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
      const query = builderOrRequest.toSQL();
      canProceedWithProcessing = query.sql.toLowerCase().startsWith("select")
        && !query.sql.toLowerCase().includes("join");
      isSQLDatabaseQueryTask = true
    } 
    /* @HINT: Check if the variable `builderOrRequest` is a http (graphql) request config object */
    else if (typeof builderOrRequest.url === "string"
      && !builderOrRequest.url.endsWith("/graphql")) {
      const hasHeaders = builderOrRequest.headers instanceof Object;
      const headers = builderOrRequest.headers; 
      const method = builderOrRequest.method.toLowerCase();
      
      /*  @HINT: This redis cache query task handler will not handle graphql query tasks */
      canProceedWithProcessing = !(hasHeaders
        && headers['content-type'] === "application/graphql")
        || !(method === "post"
            && typeof builderOrRequest.body === "string"
              && headers['content-type'] === "application/json"
              && /([\s]*){([\s]*)"([\s]*)query([\s]*)"([\s]*)\:([\s]*)"([\s]*){/m.test(
                builderOrRequest.body.toLowerCase()
              )
           ) || !(method === "get"
                  && typeof builderOrRequest.query === "string"
                    && builderOrRequest.query.includes("query={")
                );
    }

    if (canProceedWithProcessing) {
      const queryHash = murmurHash(
        isSQLDatabaseQueryTask
        ? builderOrRequest.toSQL().sql
        : `${builderOrRequest.method.toLowerCase()}-${builderOrRequest.url}`
      );
      const isCacheMiss = !(await this.canQuery(queryHash));

      if (isCacheMiss) {
        await this.cache.set(queryHash, result);
      }
    }

    await this.cache.destroyConnectionWithRedisServer();
  }
}

module.exports = RedisCacheQueryTaskHandler;
