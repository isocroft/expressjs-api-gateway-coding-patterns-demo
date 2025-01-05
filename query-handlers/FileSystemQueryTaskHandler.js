const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");

const { isEmpty } = require("../helpers");

/* @HINT: This is a file system query task handler for any file system and files/folders. */
class FileSystemQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(fileClient, contextTransformMap = {}) {
    super(
      "file system handler execution declined; either stalled connection or refused connection"
    );
    this.fileClient = fileClient;
    this.migrateContextTransformMap = contextTransformMap;
  }

  migrateContext (builderOrRequest) {
    if (typeof builderOrRequest.url !== "string") {
      return {};
    }

    return this.migrateContextTransformMap[`${builderOrRequest.method.toLowerCase()}|${builderOrRequest.url}`];
  }

  async beginProcessing (fileSystemQuery) {
    return isEmpty(fileSystemQuery) ? this.skipHandlerProcessing() : "<file contents...>";
  }

  async finalizeProcessing() {
    console.log("e don finish file system request ooo");
  }

  async finalizeProcessingWithError() {
    console.error("e don finish file system request with error ooo");
  }
}
