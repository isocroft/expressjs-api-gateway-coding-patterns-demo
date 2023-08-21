const accessEnv = require("../accessEnv");

module.exports = require("knex")({
  client: accessEnv("DB_DRIVER", "pg"),
  version: accessEnv("DB_DRIVER_VERSION", "5.7"),
  connection: {
    host: accessEnv("DB_HOST", "127.0.0.1"),
    port: accessEnv("DB_PORT", 5432),
    user: accessEnv("DB_USER", "<user>"),
    password: accessEnv("DB_PASSWORD", "<passcode>"),
    database: accessEnv("DB_NAME", "app")
  }
});
