const Cache = require("./Cache");
const {
  convertBinaryStringToBytesArray,
  convertBytesArrayToBinaryString,
  pack,
  unpack
} = require("../helpers");

/* @CHECK: https://blog.shalvah.me/posts/packing-and-unpacking-bytes */

/* @NOTE: This base class implements the Decorator coding pattern for byte-packed cache */

/* @HINT: This is the cache (with byte-packing) base/parent class. */

class CacheWithBytePacking {
  constructor(redis) {
    if (!(redis instanceof Cache)) {
      throw new Error("Cannot construct byte-packed cache instance");
    }

    this._$ = redis;
  }

  async get(key, { asBuffer = true, withEncoding = "utf8" }) {
    const buffer = await this._$.get(key, {
      asBuffer: asBuffer || true,
      withEncoding
    });

    const bytes = [];

    for (let byte of buffer.values()) {
      bytes.push(byte);
    }

    return Buffer.from(
      unpack(convertBytesArrayToBinaryString(new Uint8Array(bytes))),
      withEncoding
    );
  }

  async set(key, value, { asBuffer = true }) {
    if (typeof value !== "string") {
      return;
    }

    let modifiedValue = convertBinaryStringToBytesArray(value);

    await this._$.set(key, pack(modifiedValue), {
      asBuffer: asBuffer || true
    });
  }

  async establishConnectionWithRedisServer({ timeoutInMilliSeconds }) {
    await this._$.establishConnectionWithRedisServer({ timeoutInMilliSeconds });
  }

  async destroyConnectionWithRedisServer() {
    await this._$.destroyConnectionWithRedisServer();
  }

  async hasKey(key) {
    return await this._$.hasKey(key);
  }

  async allKeys(keyOrPattern) {
    return await this._$.allKeys(keyOrPattern);
  }
}

module.exports = CacheWithBytePacking;
