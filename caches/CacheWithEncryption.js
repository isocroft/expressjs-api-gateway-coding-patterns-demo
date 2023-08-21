const Cache = require("./Cache");
const CacheWithBytePacking = require("./CacheWithBytePacking");
const { encryptData, decryptData } = require("../helpers");

/* @NOTE: <LISKOV SUBSTITUTION PRINCIPLE> | We can change the behavior of this class by switching its' injected cache */

/* @NOTE: By switching the injected cache with a class that has the same interface contract, we maintain simplicity */

/* @NOTE: This class implements the Decorator coding pattern for encrypted cache */

/* @HINT: This is the cache (with encryption) base/parent class. */

class CacheWithEncryption {
  constructor(redis) {
    if (!(redis instanceof CacheWithBytePacking) || !(redis instanceof Cache)) {
      throw new Error("Cannot construct encrypted cache instance");
    }

    this.$_ = redis;
  }

  async get(key) {
    const buffer = await this.$_.get(key, {
      asBuffer: true,
      withEncoding: "base64"
    });

    return decryptData(buffer);
  }

  async set(key, value) {
    await this.$_.set(key, encryptData(value), { asBuffer: true });
  }

  async establishConnectionWithRedisServer({ timeoutInMilliSeconds }) {
    await this.$_.establishConnectionWithRedisServer({ timeoutInMilliSeconds });
  }

  async destroyConnectionWithRedisServer() {
    await this.$_.destroyConnectionWithRedisServer();
  }

  async hasKey(key) {
    return await this.$_.hasKey(key);
  }

  async allKeys(keyOrPattern) {
    return await this.$_.allKeys(keyOrPattern);
  }
}

module.exports = CacheWithEncryption;
