const Transaction = require("../transaction-pool/transaction");
const Wallet = require("../wallet");

class Miner {
  constructor({ blockchain, transactionPool, wallet, p2pServer }) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  mine() {
    // grab valid transactions from the pool
    const validTransactions = this.transactionPool.validTransactions();
    // include a reward for the miner
    validTransactions.push(
      Transaction.rewardTransaction({
        minerWallet: this.wallet,
        blockchainWallet: Wallet.blockchainWallet(),
      }),
    );

    console.log(validTransactions);
    // create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(validTransactions);
    // synchronize chains in the peer-to-peer server
    this.p2pServer.syncChains();
    // clear the transaction pool
    this.transactionPool.clear();
    // broadcast to every miner to clear their transaction pools
    this.p2pServer.broadcastClearTransactions();

    return block;
  }
}

module.exports = Miner;
