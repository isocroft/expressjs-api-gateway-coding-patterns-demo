const { commandOptions } = require("redis");
const { waitFor } = require("../helpers");

/* @HINT: This is the reis cache base/parent class. */

class Cache {
  constructor(redis, keyPrefix = "") {
    this.keyPrefix = keyPrefix;
    this.redis = redis;
  }

  async set(key, value, { asBuffer = false }) {
    if (typeof value !== "string") {
      return;
    }
    // Buffer.from("", "utf16le");
    await this.redis.set(
      this.keyPrefix + key,
      asBuffer ? Buffer.from(value) : value
    );
  }

  async get(key, { asBuffer = false, withEncoding = "utf8" }) {
    if (asBuffer) {
      const buffer = await this.redis.get(
        commandOptions({ returnBuffers: asBuffer }),
        this.keyPrefix + key
      );

      if (!buffer.isEncoding(withEncoding)) {
        const characters = buffer.toString(withEncoding);
        return Buffer.from(characters, withEncoding);
      }

      return buffer;
    } else {
      return await this.redis.get(this.keyPrefix + key);
    }
  }

  async allKeys(keyOrPattern) {
    const keys = [];
    for await (const scannedKey of this.redis.scanIterator({
      type: "string",
      MATCH: keyOrPattern,
      COUNT: 10
    })) {
      keys.push(scannedKey);
    }

    return keys;
  }

  async hasKey(key) {
    const keys = await this.allKeys(key);
    return keys.length > 0;
  }

  async establishConnectionWithRedisServer({ timeoutInMilliSeconds }) {
    await this.redis.connect();
    await waitFor(
      () => this.redis.isOpen && this.redis.isReady,
      100,
      timeoutInMilliSeconds
    ).orThrow(new Error("Couldn't establish connection with redis server"));
  }

  async destroyConnectionWithRedisServer() {
    await this.redis.disconnect();
  }
}

module.exports = Cache;
