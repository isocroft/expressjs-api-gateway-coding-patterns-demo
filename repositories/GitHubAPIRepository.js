const HttpServiceRepository = require("./HttpServiceRepository");

/* @HINT: This is the user data repository class. */

class GitHubAPIRepository extends HttpServiceRepository {
  get apiVersion () {
    return "2022-11-28"
  } 

  baseURL(pathName = "/") {
    return `https://api.github.com${pathName}`;
  }

  async getAllNotifications (pollingInterval = 60) {
    return await this.getRequest({
      headers: {
        'X-Poll-Interval': String(pollingInterval),
        'X-GitHub-Api-Version': this.apiVersion
      },
      pathName: '/notifications'
    })
  }
}

module.exports = GitHubAPIRepository;
