const { hashSHA256 } = require("../utils/hash");
const { DIFFICULTY, MINE_RATE } = require("../config");

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty;
  }

  toString() {
    return `Block -
      Timestamp : ${this.timestamp}
      Last Hash : ${this.lastHash.substring(0, 10)}
      Hash      : ${this.hash.substring(0, 10)}
      Nonce     : ${this.nonce}
      Difficulty: ${this.difficulty}
      Data      : ${this.data}`;
  }

  static genesis() {
    return new this({
      timestamp: "Genesis time",
      lastHash: "None",
      hash: "None",
      data: [],
      nonce: 0,
      difficulty: DIFFICULTY,
    });
  }

  static mineBlock(lastBlock, data) {
    const { hash: lastHash, difficulty: initDifficulty } = lastBlock;

    let hash;
    let timestamp;
    let nonce = 0;
    let difficulty = initDifficulty;

    do {
      nonce += 1;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = Block.hash({ timestamp, lastHash, data, nonce, difficulty });
    } while (hash.substring(0, difficulty) !== "0".repeat(difficulty));

    return new this({ timestamp, lastHash, hash, data, nonce, difficulty });
  }

  static hash({ timestamp, lastHash, data, nonce, difficulty }) {
    return hashSHA256(
      `${timestamp}${lastHash}${data}${nonce}${difficulty}`,
    ).toString();
  }

  static blockHash({ timestamp, lastHash, data, nonce, difficulty }) {
    return Block.hash({ timestamp, lastHash, data, nonce, difficulty });
  }

  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty } = lastBlock;
    difficulty =
      lastBlock.timestamp + MINE_RATE > currentTime
        ? difficulty + 1
        : difficulty - 1;
    return difficulty < 1 ? 1 : difficulty;
  }
}

module.exports = Block;
