/* @NOTE: <ABSTRACTION> | We have brought together all the common logic to this base class here! */

/* @NOTE: This base class implements the Chain-Of-Responsibility coding pattern for data query tasks */

/* @NOTE:
    In a language like PHP or Java, this class will be an abstract class with 3 protected and abstract methods:

    - beginProcessing(...);
    - finalizeProcessing(...);
    - finalizeProcessingWithError(...);

    This abstract class will also have 4 public and final methods:

    - setNextHandler(...);
    - skipHandlerProcessing();
    - skipHandlerProcessingWithCustomMessage(...);
    - handle(...);

    This abstract class will have 1 protected method

    - migrateContext(...);
*/

/* @HINT: This is the query task handler base/parent class. */

class StorageQueryTaskHandler {
  constructor(skipHandlerErrorMessage = "") {
    this.message = skipHandlerErrorMessage;
    this.nextHandler = null;
  }

  setNextHandler(handler) {
    if (handler instanceof StorageQueryTaskHandler) {
      this.nextHandler = handler;
    }
    throw new Error(
      "Cannot set next handler as object provided is not a hanlder"
    );
  }

  async beginProcessing() {
    throw new Error(
      "Implementation needed for [protected] [abstract] method {async} `process()`. \r\n\r\n" +
        " > This interface is not available from abstract class."
    );
  }

  skipHandlerProcessing() {
    throw new Error(this.message);
  }

  skipHandlerProcessingWithCustomMessage (message) {
    throw new Error(message);
  }

  async finalizeProcessing() {
    throw new Error(
      "Implementation needed for [protected] [abstract] method {async} `finalizeProcessing()`. \r\n\r\n" +
        " > This interface is not available from abstract class."
    );
  }

  async finalizeProcessingWithError() {
    throw new Error(
      "Implementation needed for [protected] [abstract] method {async} `finalizeProcessingWithError()`. \r\n\r\n" +
        " > This interface is not available from abstract class."
    );
  }

  migrateContext (builderOrRequest) {
    return builderOrRequest;
  }

  async handle(builderOrRequest) {
    let result = null;
    let processingError = null;
    let hasError = false;

    try {
      result = await this.beginProcessing(builderOrRequest);
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === this.message) {
          if (this.nextHandler !== null) {
            result = await this.nextHandler.handle(
              this.nextHandler.migrateContext(builderOrRequest)
            );
          }
        } else {
          hasError = true;
          processingError = error;
          throw error;
        }
      }
    } finally {
      if (!hasError) {
        await this.finalizeProcessing(builderOrRequest, result);
      } else {
        await this.finalizeProcessingWithError(builderOrRequest, processingError)
      }
    }
  }
}

module.exports = StorageQueryTaskHandler;
