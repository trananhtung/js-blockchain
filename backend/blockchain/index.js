const Block = require("./block");

class BlockChain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock(data) {
    const lastBlock = this.chain[this.chain.length - 1];

    const block = Block.mineBlock(lastBlock, data);

    this.chain.push(block);

    return block;
  }

  static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
      return false;
    }

    for (let i = 1; i < chain.length; i += 1) {
      const block = chain[i];
      const lastBlock = chain[i - 1];

      if (block.lastHash !== lastBlock.hash) return false;
      if (block.hash !== Block.blockHash(block)) return false;
    }

    return true;
  }

  replaceChain(newChain) {
    if (newChain.length <= this.chain.length) {
      console.warn("Received chain is not longer than the current chain.");
      return;
    }

    if (!BlockChain.isValidChain(newChain)) {
      console.warn("Received chain is invalid.");
      return;
    }

    this.chain = newChain;
  }
}

module.exports = BlockChain;
