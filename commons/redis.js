const accessEnv = require("../accessEnv");
const { createClient } = require("redis");

module.exports = createClient({
  url: `redis://${accessEnv("REDIS_USERNAME", "alice")}:${accessEnv(
    "REDIS_PASSWORD",
    "inwonderland"
  )}@${accessEnv("REDIS_SERVER", "custom.redis.server")}:${accessEnv(
    "REDIS_PORT",
    6380
  )}`
});
