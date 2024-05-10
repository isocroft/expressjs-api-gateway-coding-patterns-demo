const HttpServiceRepository = require("./HttpServiceRepository");

/* @HINT: This is the user data repository class. */

class GitHubAPIRepository extends HttpServiceRepository {
  constructor (queryTaskHandlers, lruCache) {
    super(queryTaskHandlers)
    this.cache = lruCache
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

    return Object.assign({}, { timeout: 1500, cache: this.cache }, $config)
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
