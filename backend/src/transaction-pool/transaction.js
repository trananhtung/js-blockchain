const { v4: uuid } = require("uuid");
const { hashSHA256 } = require("../utils/hash");
const { verifySignature } = require("../utils/key");

class Transaction {
  constructor() {
    this.id = uuid();
    this.input = null;
    this.outputs = [];
  }

  updateInput(senderWallet) {
    this.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(hashSHA256(this.outputs)),
    };
  }

  update({ senderWallet, recipient, amount }) {
    const senderOutput = this.outputs.find(
      ({ address }) => address === senderWallet.publicKey,
    );

    if (amount > senderOutput.amount) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return null;
    }

    senderOutput.amount -= amount;
    this.outputs.push({
      amount,
      address: recipient,
    });
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new this();
    transaction.outputs.push(...outputs);
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static newTransaction({ senderWallet, recipient, amount }) {
    const { balance: senderBalance, publicKey: senderPublicKey } = senderWallet;
    if (amount > senderBalance) {
      console.log(`Amount: ${amount} exceeds balance.`);
      return null;
    }

    return Transaction.transactionWithOutputs(senderWallet, [
      {
        amount: senderBalance - amount,
        address: senderPublicKey,
      },
      {
        amount,
        address: recipient,
      },
    ]);
  }

  static rewardTransaction({ minerWallet, blockchainWallet }) {
    return Transaction.transactionWithOutputs(blockchainWallet, [
      {
        amount: blockchainWallet.balance,
        address: minerWallet.publicKey,
      },
    ]);
  }

  static signTransaction(transaction, senderWallet) {
    transaction.updateInput(senderWallet);
  }

  static verifyTransaction(transaction) {
    return verifySignature({
      publicKey: transaction.input.address,
      dataHash: hashSHA256(transaction.outputs),
      signature: transaction.input.signature,
    });
  }
}

module.exports = Transaction;
