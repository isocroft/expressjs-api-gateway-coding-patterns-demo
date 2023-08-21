const Container = require("./Container");

module.exports = (function () {
  let container = new Container();

  require("./providers/cacheProvider")(container);
  require("./providers/databaseProvider")(container);
  require("./providers/queryHandlersProvider")(container);
  require("./providers/repositoriesProvider")(container);
  require("./providers/httpProvider")(container);

  return container;
})();
