const Container = require("./Container");

module.exports = (function () {
  let container = new Container();

  require("./providers/cacheProvider")(container);
  require("./providers/databaseProvider")(container);
  require("./providers/httpProvider")(container);
  require("./providers/queryHandlersProvider")(container);
  require("./providers/repositoriesProvider")(container);

  return container;
})();
