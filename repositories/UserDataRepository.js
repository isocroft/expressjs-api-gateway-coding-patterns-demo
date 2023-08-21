const container = require("../IoC-container");
const DatabaseTableRepository = require("./DatabaseTableRepository");

/* @HINT: This is the user data repository class. */

class UserDataRepository extends DatabaseTableRepository {
  get table() {
    return "users";
  }

  get queryBuilder() {
    return container.Database(this.table);
  }
}

module.exports = UserDataRepository;
