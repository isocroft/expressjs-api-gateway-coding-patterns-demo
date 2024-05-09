const PostgreSQLDatabaseQueryTaskHandler = require("../../query-handlers/PostgreSQLDatabaseQueryTaskHandler");
const GraphQLServiceQueryTaskHandler = require("../../query-handlers/GraphQLServiceQueryTaskHandler");
const RESTServiceQueryTaskHandler = require("../../query-handlers/RESTServiceQueryTaskHandler");
const RedisCacheQueryTaskHandler = require("../../query-handlers/RedisCacheQueryTaskHandler");

const pg = require("pg")

module.exports = function (c) {
  c.service(
    "PostgreSQLDatabaseQueryTaskHandler",
    (c) => new PostgreSQLDatabaseQueryTaskHandler(c.Database)
  );
  c.service(
    "RedisCacheQueryTaskHandler",
    (c) => new RedisCacheQueryTaskHandler(c.EncryptedCache)
  );
  c.service(
    "GraphQLServiceQueryTaskHandler",
    (c) => new GraphQLServiceQueryTaskHandler(c.GraphQLClient)
  );
  c.service(
    "RESTServiceQueryTaskHandler",
    (c) => new RESTServiceQueryTaskHandler(c.RestClient)
  );
};
