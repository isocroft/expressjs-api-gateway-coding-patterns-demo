/* @NOTE: <ABSTRACTION> | We have brought together all the common logic to this base class here! */

/* @NOTE: This base class implements the Chain-Of-Responsibility coding pattern for data query tasks */

/* @INFO:
    In a language like PHP or Java, this class will be an abstract class with 4 protected and abstract methods:

    - beginProcessing(...);
    - finalizeProcessing(...);
    - finalizeProcessingWithError(...);
    - alternateProcessing(...);

    This abstract class will also have 1 protected and final method:

    - skipHandlerProcessing(...);

    This abstract class will also have 2 public and final methods:

    - handle(...);
    - setNextHandler(...);

    This abstract class will have 2 protected methods

    - migrateQueryTask(...);
    - skipHandlerProcessingWithCustomMessage(...);
*/

/* @HINT: This is the query task handler base/parent class. */

class StorageQueryTaskHandler {
  constructor(skipHandlerErrorMessage = "") {
    /* @INFO 2 private member variables */
    this.message = skipHandlerErrorMessage;
    this.nextHandler = null;
  }

  setNextHandler(handler) {
    if (handler instanceof StorageQueryTaskHandler) {
      this.nextHandler = handler;
      return;
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

  skipHandlerProcessing(error) {
    if (this.nextHandler === null) {
      throw error;
    }
    throw new Error(this.message);
  }

  skipHandlerProcessingWithCustomMessage (message) {
    throw new Error(message);
  }

  async alternateProcessing () {
    throw new Error(
      "Implementation needed for [protected] [abstract] method {async} `finalizeProcessing()`. \r\n\r\n" +
        " > This interface is not available from abstract class."
    );
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

  migrateQueryTask (builderOrRequest) {
    return builderOrRequest;
  }

  async handle (builderOrRequest) {
    let result = null;
    let processingError = null;
    let noResult = true;
    let hasError = false;

    try {
      try {
        result = await this.beginProcessing(
          this.migrateQueryTask(builderOrRequest)
        );
        noResult = false;
        return result;
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error
        }

        if (error.message === this.message
          && this.nextHandler !== null) {
            result = await this.nextHandler.handle(
              builderOrRequest
            );
            noResult = false;
            return result;
        } else {
          hasError = true;
          processingError = error;
          throw error;
        }
      } finally {
        if (!hasError) {
          await this.finalizeProcessing(this.migrateQueryTask(builderOrRequest), result);
        } else {
          await this.finalizeProcessingWithError(builderOrRequest, processingError);
          if (noResult) {
            /* @HINT: If there's no result and we have an error, try to get a result from an alternate process */
            if (processingError.message === this.message) {
              result = await this.alternateProcessing(
                this.migrateQueryTask(builderOrRequest)
              );
              noResult = false;
              return result;
            }
          }
        }
      }
    } catch ($error) {
      throw $error;
    }

    return result;
  }
}

module.exports = StorageQueryTaskHandler;
