const StorageQueryTaskHandler = require("../query-handlers/StorageQueryTaskHandler");

/* @HINT: This is a storage query manger for all data access an storage needs of a data repository. */
class StorageQueryHandlersManager {
  constructor(storageQueryHandlers = []) {
    const totalCount = storageQueryHandlers.length;

    if (totalCount === 0) {
      throw new Error("Cannot proceed: No storage query task handlers found");
    }

    for (let count = 0; count + 1 < totalCount && totalCount > count; count++) {
      const previousQueryTaskHandler = storageQueryHandlers[count];
      const nextQueryTaskHandler = storageQueryHandlers[count + 1];

      if (previousQueryTaskHandler instanceof StorageQueryTaskHandler) {
        previousQueryTaskHandler.setNextHandler(nextQueryTaskHandler);
      } else {
        continue;
      }
    }

    const [rootTaskHandler] = storageQueryHandlers;

    this.rootTaskHandler = rootTaskHandler;
  }

  async execute(queryObject) {
    return this.rootTaskHandler.handle(
      queryObject
    );
  }

  swapRootHandler(newRootTaskHandler) {
    if (!(newRootTaskHandler instanceof StorageQueryTaskHandler)) {
      throw new Error(
        "Cannot proceed: root handler not swapable as object provided isn't a handler"
      );
    }

    const formerRootTaskHandler = this.rootTaskHandler;

    this.rootTaskHandler = newRootTaskHandler;
    this.rootTaskHandler.setNextHandler(formerRootTaskHandler);
  }
}

module.exports = StorageQueryHandlersManager;
