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

  async canQuery(queryKey) {
    return this.cache.hasKey(queryKey);
  }

  async beginProcessing(builderOrRequest) {
    let canProceedWithProcessing = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder instance */
    if (typeof builderOrRequest.toSQL === "function") {
      /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
      const query = builderOrRequest.toSQL();
      canProceedWithProcessing = query.sql.toLowerCase().startsWith("select");
    } else {
      canProceedWithProcessing =
        builderOrRequest.contentType === "application/graphql";
    }

    await this.cache.establishConnectionWithRedisServer({
      timeoutInMilliSeconds: 1200
    });

    if (canProceedWithProcessing) {
      const queryHash = murmurHash(builderOrRequest.toSQL().sql);
      const isCacheHit = await this.canQuery(queryHash);

      if (isCacheHit) {
        return await this.cache.get(queryHash);
      }
    }

    this.skipHandlerProcessing();
  }

  async finalizeProcessing(builderOrRequest, result) {
    let canProceedWithProcessing = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder instance */
    if (typeof builderOrRequest.toSQL === "function") {
      /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
      const query = builderOrRequest.toSQL();
      canProceedWithProcessing = query.sql.toLowerCase().startsWith("select");
    } else {
      canProceedWithProcessing =
        builderOrRequest.contentType === "application/graphql";
    }

    if (canProceedWithProcessing) {
      const queryHash = murmurHash(builderOrRequest.toSQL().sql);
      const isCacheMiss = await !this.canQuery(queryHash);

      if (isCacheMiss) {
        await this.cache.set(queryHash, result);
      }
    }

    await this.cache.destroyConnectionWithRedisServer();
  }
}

module.exports = RedisCacheQueryTaskHandler;
