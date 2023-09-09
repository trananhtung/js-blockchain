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

    blockchain.chain.forEach(({ data }) => {
      transactions.push(...data);
    });

    // find transactions that have been made by this wallet
    const walletInputTs = transactions.filter(
      ({ input }) => input.address === this.publicKey,
    );
    // reduce the transactions to the most recent one
    const recentInputT = walletInputTs.reduce(
      (prev, curr) =>
        prev?.input?.timestamp > curr?.input?.timestamp ? prev : curr,
      0,
    );

    if (!recentInputT) {
      return balance;
    }

    // calculate the balance
    balance = recentInputT.outputs.find(
      ({ address }) => address === this.publicKey,
    ).amount;

    const startTime = recentInputT.input.timestamp;

    transactions.forEach(({ input, outputs }) => {
      if (input.timestamp > startTime) {
        outputs.forEach(({ address, amount }) => {
          if (address === this.publicKey) {
            balance += amount;
          }
        });
      }
    });

    return balance;
  }
}

module.exports = Wallet;
