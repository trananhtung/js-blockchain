const Transaction = require("../transaction-pool/transaction");
const { INITIAL_BALANCE } = require("../../config");
const { generateKeyPair } = require("../utils/key");

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = generateKeyPair();
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }

  toString() {
    return `Wallet -
      Balance  : ${this.balance}
      PublicKey: ${this.publicKey.toString()}`;
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  createTransaction({ recipient, amount, blockchain, transactionPool }) {
    this.balance = this.calculateBalance(blockchain);

    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return null;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      transaction.update({
        senderWallet: this,
        recipient,
        amount,
      });
    } else {
      transaction = Transaction.newTransaction({
        senderWallet: this,
        recipient,
        amount,
      });
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = "blockchain-wallet";
    return blockchainWallet;
  }

  calculateBalance(blockchain) {
    let { balance } = this;
    const transactions = [];
    blockchain.chain.forEach((block) =>
      block.data.forEach((transaction) => {
        transactions.push(transaction);
      }),
    );

    const walletInputTs = transactions.filter(
      (transaction) => transaction.input.address === this.publicKey,
    );

    let startTime = 0;

    if (walletInputTs.length > 0) {
      const recentInputT = walletInputTs.reduce((prev, current) =>
        prev.input.timestamp > current.input.timestamp ? prev : current,
      );

      balance = recentInputT.outputs.find(
        (output) => output.address === this.publicKey,
      ).amount;

      startTime = recentInputT.input.timestamp;
    }

    transactions.forEach((transaction) => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.forEach((output) => {
          if (output.address === this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });

    return balance;
  }
}

module.exports = Wallet;
