const crypto = require("crypto");

/**
 *
 * @param {Number} durationMilliSeconds
 *
 * @returns {Promise}
 *
 * @see https://davidwalsh.name/waitfortime/
 */
const sleepFor = (durationMilliSeconds = 10) => {
  return new Promise((resolve) => setTimeout(resolve, durationMilliSeconds));
};

/**
 *
 * @param {Function} conditionCallback
 * @param {Number} pollIntervalMilliSeconds
 * @param {Number} timeoutAfterMilliSeconds
 *
 * @returns {Promise}
 *
 * @see https://davidwalsh.name/waitfor/
 */
const waitFor = async (
  conditionCallback,
  pollIntervalMilliSeconds = 50,
  timeoutAfterMilliSeconds = 3000
) => {
  const startTimeMilliSeconds = Date.now();
  const timeoutThresholdMilliseconds =
    startTimeMilliSeconds +
    (typeof timeoutAfterMilliSeconds === "number"
      ? timeoutAfterMilliSeconds
      : 0);

  let timedOut = false;
  let error = new Error("Condition not met before timeout");

  while (true) {
    if (Date.now() >= timeoutThresholdMilliseconds) {
      timedOut = true;
      break;
    }

    const result = conditionCallback();

    if (result) {
      return result;
    }

    await sleepFor(pollIntervalMilliSeconds);
  }

  if (timedOut) {
    throw error;
  }

  return {
    orThrow(newError) {
      error = newError;
    }
  };
};

/**
 *
 * @param {Uint8Array} bytes
 *
 * @return {String}
 *
 * @see https://stegriff.co.uk/upblog/bit-packing-binary-in-javascript-and-json/
 */
const pack = (bytes = []) => {
  const characters = [];

  for (let count = 0, bytesLength = bytes.length; count < bytesLength; ) {
    characters.push(((bytes[count++] & 0xff) << 8) | (bytes[count++] & 0xff));
  }

  String.fromCharCode(...characters);
};

/**
 *
 * @param {String} utf16EncodedString
 *
 * @return {Array}
 *
 * @see https://stegriff.co.uk/upblog/bit-packing-binary-in-javascript-and-json/
 */
const unpack = (utf16EncodedString) => {
  const bytes = [];

  for (
    let count = 0, binaryStringLength = utf16EncodedString.length;
    count < binaryStringLength;
    count++
  ) {
    const character = utf16EncodedString.charCodeAt(count);
    bytes.push(character >>> 8, character & 0xff);
  }
  return bytes;
};

/**
 *
 * @param {Mixed} objectValue
 *
 * @returns {Boolean}
 */
const isEmpty = (objectValue) => {
  if (!objectValue || typeof objectValue !== "object") {
    return true;
  }

  for (const prop in objectValue) {
    if (Object.prototype.hasOwnProperty.call(objectValue, prop)) {
      return false;
    }
  }

  return JSON.stringify(objectValue) === JSON.stringify({});
};

/**
 * @class 
 * @see https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e
 */

class StringReader {
  constructor(source) {
    this.position = 0;
    this.source = source;
  }

  isInRange(position) {
    if (position > -1 && position < this.source.length) return true;

    return false;
  }

  next() {
    if (!this.isInRange(this.position)) return null;

    return this.source[this.position++].charCodeAt(0);
  }

  previous() {
    if (!this.isInRange(this.position)) return null;

    return this.source[this.position--].charCodeAt(0);
  }

  peak() {
    const oldPosition = this.position;

    const character = this.next();

    this.position = oldPosition;

    return character;
  }

  seek(position) {
    if (!this.isInRange(position)) {
      throw RangeError(`Offset: ${position} is out of range`);
    }

    this.position = position;

    return this;
  }

  advance() {
    const position = this.position + 1;

    if (!this.isInRange(position)) this.position = -1;
    else this.position++;

    return this;
  }

  getPosition() {
    return this.position;
  }
}

/**
 * @callback isLeadingSurrogate
 * @see https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e
 */

const isLeadingSurrogate = (charCode) => {
  return charCode >= 0xd800 && charCode <= 0xdbff;
};

/**
 * @callback isTrailingSurrogate
 * @see https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e
 */
const isTrailingSurrogate = (charCode) => {
  return charCode >= 0xdc00 && charCode <= 0xdfff;
};


/**
 * @class StringEncoder
 * @see https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e
 */
class StringEncoder {
  static UTF16SurrogatePairToCodePoint(leading, trailing) {
    return (leading - 0xd800) * 0x400 + (trailing - 0xdc00) + 0x10000;
  }

  static stringToUtf8(source) {
    const utf8codes = [];

    const stringReader = new StringReader(source);

    let charCode = null;

    /* eslint-disable-next-line no-cond-assign */
    while ((charCode = stringReader.next()) !== null) {
      /* Character takes one byte in UTF-8 (US-ASCII range) */
      if (charCode >= 0x0000 && charCode <= 0x007f) {
        utf8codes.push(charCode);

        /* Character takes two bytes in UTF-8 */
      } else if (charCode >= 0x0080 && charCode <= 0x07ff) {
        let firstByte = 0xc0 | (charCode >>> 6);
        let secondByte = 0x80 | (charCode & 0x3f);

        utf8codes.push(firstByte, secondByte);
      } else if (isLeadingSurrogate(charCode)) {
        /* High surrogate */
        const leading = charCode;

        /* Low surrogate */
        const trailing = stringReader.peak();

        if (trailing && isTrailingSurrogate(trailing)) {
          /* Surrogate pairs takes four bytes in UTF-8 */
          const codePoint = StringEncoder.UTF16SurrogatePairToCodePoint(
            leading,
            trailing
          );

          let firstByte = 0xf0 | (codePoint >>> 18);
          let secondByte = 0x80 | ((codePoint >>> 12) & 0x3f);
          let thirdByte = 0x80 | ((codePoint >>> 6) & 0x3f);
          let fourthByte = 0x80 | (codePoint & 0x3f);

          utf8codes.push(firstByte, secondByte, thirdByte, fourthByte);

          stringReader.advance();
        } else {
          /* Isolated high surrogate */
        }
      } else if (isTrailingSurrogate(charCode)) {
        /* Low surrogate */
        /* Isolated low surrogate */
      } else if (charCode >= 0x0800 && charCode <= 0xffff) {
        /* Character takes three bytes in UTF-8 */
        let firstByte = 0xe0 | (charCode >>> 12);
        let secondByte = 0x80 | ((charCode >>> 6) & 0x3f);
        let thirdByte = 0x80 | (charCode & 0x3f);

        utf8codes.push(firstByte, secondByte, thirdByte);
      }
    }

    return new Uint8Array(utf8codes);
  }
}

/**
 * @class StringDecoder
 * @see https://medium.com/@vincentcorbee/utf-16-to-utf-8-in-javascript-18b4b11b6e1e
 */

class StringDecoder {
  static stringFromUTF16CharCode(charCodes) {
    return String.fromCharCode(...charCodes);
  }

  static UTF8ToString(uint8Array) {
    const charCodes = [];

    for (
      let index = 0, length = uint8Array.byteLength;
      index < length;
      index++
    ) {
      const charCode = uint8Array[index];

      /* Character takes one byte */
      if (charCode < 0xc0) charCodes.push(charCode);
      /* Character takes two bytes */ else if (charCode < 0xe0)
        charCodes.push(((charCode & 0x1f) << 6) | (uint8Array[++index] & 0x3f));
      /* Character takes three bytes */ else if (charCode < 0xef)
        charCodes.push(
          ((charCode & 0xf) << 12) |
            ((uint8Array[++index] & 0x3f) << 6) |
            (uint8Array[++index] & 0x3f)
        );
      /* Character takes four bytes */ else {
        /* Character consists of high and low surrogate pair */
        const codePoint =
          (((charCode & 0x7) << 18) |
            ((uint8Array[++index] & 0x3f) << 12) |
            ((uint8Array[++index] & 0x3f) << 6) |
            (uint8Array[++index] & 0x3f)) -
          0x10000;

        charCodes.push(
          (codePoint >>> 10) + 0xd800,
          (codePoint & 0x3ff) + 0xdc00
        );
      }
    }

    return StringDecoder.stringFromUTF16CharCode(charCodes);
  }
}

/**
 *
 * @param {Uint8Array} bytesArray
 *
 * @returns {String}
 */
const convertBytesArrayToBinaryString = (bytesArray) => {
  const typedArrayUTF8 = bytesArray;
  return StringDecoder.UTF8ToString(typedArrayUTF8);
};

/**
 *
 * @param {String} rawBinaryString
 *
 * @returns {Uint8Array}
 */
const convertBinaryStringToBytesArray = (rawBinaryString) => {
  const javaScriptStringUTF16 = rawBinaryString;
  return StringEncoder.stringToUtf8(javaScriptStringUTF16);
};

const encryptionKey = crypto
  .createHash("sha512")
  .update("Shcxb573jbci9nbdk")
  .digest("hex")
  .substring(0, 32);

const encryptionIV = crypto
  .createHash("sha512")
  .update("92hFAywb579MNmjh86")
  .digest("hex")
  .substring(0, 16);

/**
 *
 * @param {String} plainData
 * @param {String} sourceEncoding
 *
 * @returns {String}
 */
const encryptData = (plainData, sourceEncoding = "utf8") => {
  const cipherIV = crypto.createCipheriv(
    "aes-256-ocb",
    encryptionKey,
    encryptionIV
  );
  return Buffer.from(
    cipherIV.update(plainData, sourceEncoding, "hex") + cipherIV.final("hex")
  ).toString("base64");
};

/**
 *
 * @param {Buffer | String} encryptedData
 * @param {String} sourceEncoding
 *
 * @returns {String}
 */
const decryptData = (encryptedData, sourceEncoding = "utf8") => {
  const buffer =
    encryptedData instanceof Buffer && encryptedData.isEncoding("base64")
      ? encryptedData
      : Buffer.from(encryptedData, "base64");
  const decipherIV = crypto.createDecipheriv(
    "aes-256-ocb",
    encryptionKey,
    encryptionIV
  );
  return (
    decipherIV.update(buffer.toString(sourceEncoding), "hex", sourceEncoding) +
    decipherIV.final(sourceEncoding)
  );
};

/*
 *  The MurmurHash3 algorithm was created by Austin Appleby.  This JavaScript port was authored
 *  by whitequark (based on Java port by Yonik Seeley) and is placed into the public domain.
 *  The author hereby disclaims copyright to this source code.
 *
 *  This produces exactly the same hash values as the final C++ version of MurmurHash3 and
 *  is thus suitable for producing the same hash values across platforms.
 *
 *  There are two versions of this hash implementation. First interprets the string as a
 *  sequence of bytes, ignoring most significant byte of each codepoint. The second one
 *  interprets the string as a UTF-16 codepoint sequence, and appends each 16-bit codepoint
 *  to the hash independently. The latter mode was not written to be compatible with
 *  any other implementation, but it should offer better performance for JavaScript-only
 *  applications.
 *
 *  See http://github.com/whitequark/murmurhash3-js for future updates to this file.
 */

const MurmurHash3 = {
  mul32: function (m, n) {
    var nlo = n & 0xffff;
    var nhi = n - nlo;
    return (((nhi * m) | 0) + ((nlo * m) | 0)) | 0;
  },

  hashBytes: function (data, len, seed) {
    var c1 = 0xcc9e2d51;
    var c2 = 0x1b873593;

    var h1 = seed;
    var roundedEnd = len & ~0x3;

    for (var i = 0; i < roundedEnd; i += 4) {
      var k1 =
        (data.charCodeAt(i) & 0xff) |
        ((data.charCodeAt(i + 1) & 0xff) << 8) |
        ((data.charCodeAt(i + 2) & 0xff) << 16) |
        ((data.charCodeAt(i + 3) & 0xff) << 24);

      k1 = this.mul32(k1, c1);
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17); // ROTL32(k1,15);
      k1 = this.mul32(k1, c2);

      h1 ^= k1;
      h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19); // ROTL32(h1,13);
      h1 = (h1 * 5 + 0xe6546b64) | 0;
    }

    k1 = 0;

    switch (len % 4) {
      case 3:
        k1 = (data.charCodeAt(roundedEnd + 2) & 0xff) << 16;
      // fallthrough
      case 2:
        k1 |= (data.charCodeAt(roundedEnd + 1) & 0xff) << 8;
      // fallthrough
      case 1:
        k1 |= data.charCodeAt(roundedEnd) & 0xff;
        k1 = this.mul32(k1, c1);
        k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17); // ROTL32(k1,15);
        k1 = this.mul32(k1, c2);
        h1 ^= k1;
        break;
      default:
        k1 = 0;
    }

    // finalization
    h1 ^= len;

    // fmix(h1);
    h1 ^= h1 >>> 16;
    h1 = this.mul32(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = this.mul32(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;

    return h1;
  },

  hashString: function (data, len, seed) {
    var c1 = 0xcc9e2d51;
    var c2 = 0x1b873593;

    var h1 = seed;
    var roundedEnd = len & ~0x1;

    for (var i = 0; i < roundedEnd; i += 2) {
      var k1 = data.charCodeAt(i) | (data.charCodeAt(i + 1) << 16);

      k1 = this.mul32(k1, c1);
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17); // ROTL32(k1,15);
      k1 = this.mul32(k1, c2);

      h1 ^= k1;
      h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19); // ROTL32(h1,13);
      h1 = (h1 * 5 + 0xe6546b64) | 0;
    }

    if (len % 2 === 1) {
      k1 = data.charCodeAt(roundedEnd);
      k1 = this.mul32(k1, c1);
      k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17); // ROTL32(k1,15);
      k1 = this.mul32(k1, c2);
      h1 ^= k1;
    }

    // finalization
    h1 ^= len << 1;

    // fmix(h1);
    h1 ^= h1 >>> 16;
    h1 = this.mul32(h1, 0x85ebca6b);
    h1 ^= h1 >>> 13;
    h1 = this.mul32(h1, 0xc2b2ae35);
    h1 ^= h1 >>> 16;

    return h1;
  }
};

/**
 *
 * @param {String} data
 *
 * @returns {String}
 */
const murmurHash = (data) => {
  const hash = MurmurHash3.hashBytes(data, data.length, 150);

  return Number(Math.abs(hash) % 262144263494052048758001).toString(16);
};

module.exports = {
  encryptData,
  decryptData,
  pack,
  unpack,
  isEmpty,
  waitFor,
  sleepFor,
  murmurHash,
  convertBytesArrayToBinaryString,
  convertBinaryStringToBytesArray
};
