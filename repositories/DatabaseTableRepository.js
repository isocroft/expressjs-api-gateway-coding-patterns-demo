const StorageQueryHandlersManager = require("./StorageQueryHandlersManager");
const { isEmpty } = require("../helpers");

/* @NOTE: <DEPENDENCIES> | Implicit dependencies can often lead to tight coupling but not always! */

/* @HINT: This is a database table repository base class. */
class DatabaseTableRepository {
  constructor(queryHandlers = []) {
    /* @NOTE: <COMPOSITION> | Composition can also lead to tight coupling! */
    /* @NOTE: Tight coupling (and tight cohesion) here: will allow temporarily */
    this.queryManager = new StorageQueryHandlersManager(queryHandlers);
  }

  get table() {
    throw new Error("table name value is not available from abstract class");
  }

  get queryBuidler() {
    throw new Error(
      "query builder object is not available from abstract class"
    );
  }

  set newRootHandler(rootHandler) {
    this.queryManager.swapRootHandler(rootHandler);
  }

  whenConflict(queryBuidler, conflictColumn = undefined) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    return typeof conflictColumn === "string"
      ? queryBuidler.onConflict(conflictColumn)
      : queryBuidler;
  }

  merge(queryBuidler, columnsToMerge = []) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    return Array.isArray(columnsToMerge) && columnsToMerge.length > 0
      ? queryBuidler.merge(columnsToMerge)
      : queryBuidler.merge();
  }

  addWhereClauses(queryBuidler, whereClausesCallback = () => undefined) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    return typeof whereClausesCallback === "function"
      ? queryBuidler.where(whereClausesCallback)
      : queryBuidler;
  }

  async fetchAll(columnsToFetch = ["*"], whereClausesCallback = undefined) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    const queryBuilder = this.queryBuilder;
    const { addWhereClauses } = this;

    if (!columnsToFetch || columnsToFetch.length === 0) {
      columnsToFetch = ["*"];
    }

    return this.queryManager.execute(
      addWhereClauses(queryBuilder, whereClausesCallback)
        .select(...columnsToFetch)
        .clone()
    );
  }

  async modify(
    columnsToFetch = ["*"],
    whereClausesCallback = undefined,
    rowsToUpdate = {}
  ) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    const queryBuilder = this.queryBuilder;
    const { addWhereClauses } = this;

    if (isEmpty(rowsToUpdate)) {
      throw new Error("Cannot proceed: No rows to update found");
    }

    if (!columnsToFetch || columnsToFetch.length === 0) {
      columnsToFetch = ["*"];
    }

    return this.queryManager.execute(
      addWhereClauses(queryBuilder, whereClausesCallback)
        .update(rowsToUpdate, columnsToFetch)
        .clone()
    );
  }

  async fetchFirst() {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    const queryBuilder = this.queryBuilder;

    return this.queryManager.execute(queryBuilder.first().clone());
  }

  async fetchFirstWhere(whereClausesCallback = undefined) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    const queryBuilder = this.queryBuilder;
    const { addWhereClauses } = this;

    return this.queryManager.execute(
      addWhereClauses(queryBuilder, whereClausesCallback).first().clone()
    );
  }

  async keepWhenConflict(
    rowsToInsert = [],
    conflictColumn = "id",
    columnsToMerge = []
  ) {
    /* @CHECK: https://github.com/knex/knex/issues/3018#issuecomment-458781094/ */
    const queryBuilder = this.queryBuilder;
    const { merge, whenConflict } = this;

    return this.queryManager.execute(
      merge(
        whenConflict(
          queryBuilder.insert(
            rowsToInsert.length === 1 ? rowsToInsert[0] : rowsToInsert
          ),
          conflictColumn
        ),
        columnsToMerge
      ).clone()
    );
  }
}

module.exports = DatabaseTableRepository;
