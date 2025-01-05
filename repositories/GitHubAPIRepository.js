const HttpServiceRepository = require("./HttpServiceRepository");

/* @HINT: This is the github (third-party) api repository class. */

class GitHubAPIRepository extends HttpServiceRepository {
  constructor (queryTaskHandlers, httpLRUCache = null) {
    super(queryTaskHandlers)
    this.httpCache = httpLRUCache
  }

  get apiVersion () {
    return "2022-11-28"
  }

  baseURL(pathName = "/") {
    return `https://api.github.com${pathName}`;
  }

  requestConfig(
    pathName = "/",
    httpMethod = "GET",
    headers = {},
    requestParams = {}
  ) {
    const $config = super.requestConfig(
      pathName,
      httpMethod,
      Object.assign(headers, {
        accept: 'application/json',
        'content-type': 'application/json'
      }),
      requestParams
    )

    return Object.assign(
      {},
      { timeout: this.httpTimeout, cache: this.httpCache },
      $config
    );
  }

  async getAllNotifications (pollingInterval = 60) {
    return this.httpGetRequest({
      headers: {
        'x-poll-interval': String(pollingInterval),
        'X-GitHub-Api-Version': this.apiVersion
      },
      pathName: '/notifications'
    })
  }
}

module.exports = GitHubAPIRepository;
