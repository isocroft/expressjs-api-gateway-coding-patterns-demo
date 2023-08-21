const StorageQueryTaskHandler = require("../query-handlers/StorageQueryTaskHandler");

/* @HINT: This is a storage query manger for all data access an storage needs of a data repository. */
class StorageQueryHandlersManager {
  constructor(storageQueryHandlers = []) {
    const totalCount = storageQueryHandlers.length;

    if (totalCount === 0) {
      throw new Error("Cannot proceed: No storage query task handlers found");
    }

    for (let count = 0; count + 1 < totalCount && totalCount > count; count++) {
      const previousQueryHandler = storageQueryHandlers[count];
      const nextQueryHandler = storageQueryHandlers[count + 1];

      previousQueryHandler.setNextHandler(nextQueryHandler);
    }

    const [rootHandler] = storageQueryHandlers;

    this.rootHandler = rootHandler;
  }

  async execute(queryObject) {
    return await this.rootHandler.handle(queryObject);
  }

  swapRootHandler(newRootHandler) {
    if (!(newRootHandler instanceof StorageQueryTaskHandler)) {
      console.error(
        "Cannot proceed: root handler not swapable as object provided isn't a handler"
      );
      return false;
    }

    const formerRootHandler = this.rootHandler;

    this.rootHandler = newRootHandler;
    this.rootHandler.setNextHandler(formerRootHandler);
    return true;
  }
}

module.exports = StorageQueryHandlersManager;
