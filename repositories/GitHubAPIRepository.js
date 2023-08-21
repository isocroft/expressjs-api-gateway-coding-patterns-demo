const container = require("../IoC-container");
const HttpServiceRepository = require("./HttpServiceRepository");

/* @HINT: This is the user data repository class. */

class GitHubAPIRepository extends HttpServiceRepository {
  baseURL(pathName = "/") {
    return `https://api.github.com${pathName}`;
  }

  get httpRequest() {
    return container.Http;
  }
}

module.exports = GitHubAPIRepository;
