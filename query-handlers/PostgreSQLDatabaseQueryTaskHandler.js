const StorageQueryTaskHandler = require("./StorageQueryTaskHandler");

/* @NOTE: <INHERITANCE> | Don't create premature parent classes | Keep it simple! */

/* @HINT: This is a database query task handler for a PostgreSQL database. */
/* @HINT: There is no need to create a parent class `DatabaseQueryTaskHandler` yet. */
/* @HINT: 
    If for the meantime PostgreSQL is the database of choice now and there's no 
    indication that this will change in the forseeable future, then, there no need
    to preempt the future by creating a parent base class (`DatabaseQueryTaskHandler`)
    and then extending it to create `PostgreSQLDatabaseQueryTaskHandler` derived class
    or a `MySQLDatabaseQueryTaskHandler` or `MSSQLDatabaseQueryTaskHandler` derived 
    classes either
*/

class PostgreSQLDatabaseQueryTaskHandler extends StorageQueryTaskHandler {
  constructor(databaseContainer) {
    super("database handler execution declined");
    this.database = databaseContainer;
    this.databaseConnection = null;
  }

  async beginProcessing(builderOrRequest) {
    let canProceedWithProcessing = false;

    /* @HINT: Check if variable `builderOrRequest` is a knex query builder instance */
    if (typeof builderOrRequest.toSQL === "function") {
      canProceedWithProcessing = true;
    }

    if (canProceedWithProcessing) {
      this.databaseConnection = await this.database.client.acquireConnection();
      this.databaseConnection.query('SET timezone="UTC";');

      /* @HINT: Setup a database query timeout */
      builderOrRequest.timeout(5500, {
        cancel: true
      });

      /* @HINT: database query result initialization */
      let queryResult = null;

      /* @HINT: Setup database transaction for database query */
      await this.database.transaction(async (transaction) => {
        /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
        queryResult = await builderOrRequest.transacting(transaction);
      });

      return queryResult;
    }

    this.skipHandlerProcessing();
  }

  async finalizeProcessing() {
    await this.database.client.releaseConnection(this.databaseConnection);
  }
}

module.exports = PostgreSQLDatabaseQueryTaskHandler;
