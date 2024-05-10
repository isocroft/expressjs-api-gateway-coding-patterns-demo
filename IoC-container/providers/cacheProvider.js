const accessEnv = require("../../accessEnv");
const redis = require("../../commons/redis");

const QuickLRU = require('quick-lru');

const Cache = require("../../caches/Cache");
const CacheWithBytePacking = require("../../caches/CacheWithBytePacking");
const CacheWithEncryption = require("../../caches/CacheWithEncryption");

module.exports = function (c) {
  c.service("LRUCache", () => new QuickLRU({ maxSize: 1000, maxAge: 180000 }))
  c.service("RedisCache", () => redis);
  c.service(
    "Cache",
    (c) => new Cache(redis, accessEnv("REDIS_KEY_PREFIX", ""))
  );
  c.service("BytePackedCache", (c) => new CacheWithBytePacking(c.Cache));
  c.service(
    "EncryptedCache",
    (c) => new CacheWithEncryption(c.CacheWithBytePacking)
  );
};
