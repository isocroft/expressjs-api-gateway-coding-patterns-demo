const GitHubAPIRepository = require("../../repositories/GitHubAPIRepository");
const UserDataRepository = require("../../repositories/UserDataRepository");

module.exports = function (c) {
  c.service(
    "UserModelRepository",
    (c) =>
      new UserDataRepository([
        c.RedisCacheQueryTaskHandler,
        c.PostgreSQLDatabaseQueryTaskHandler
      ], c.Database)
  );
  c.service(
    "GitHubAPIRepository",
    (c) => new GitHubAPIRepository([
      c.RESTServiceQueryTaskHandler,
      /* @HINT: Redundancy, in case GitHub REST API is down, use the GraphQL API instead */
      c.GraphQLServiceQueryTaskHandler
    ])
  );
};
