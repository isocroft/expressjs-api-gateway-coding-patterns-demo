const DatabaseTableRepository = require("./DatabaseTableRepository");

/* @HINT: This is the user data repository class. */

class UserDataRepository extends DatabaseTableRepository {
  constructor (queryTaskHandlers, Database) {
    super(queryTaskHandlers)
    this.Database = Database
  }

  get table() {
    return "users";
  }

  get queryBuilder() {
    return this.Database(this.table);
  }

  async fetchAllUsers (columnsToFetch = ['*']) {
    return await this.fetchAll(columnsToFetch)
  }
}

module.exports = UserDataRepository;
