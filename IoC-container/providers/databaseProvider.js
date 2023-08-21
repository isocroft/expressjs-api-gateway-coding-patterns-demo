const knex = require("../../commons/knex");

module.exports = function (c) {
  c.service("Database", () => knex);
};
