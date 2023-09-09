const express = require("express");
const bodyParser = require("body-parser");

const BlockChain = require("../blockchain");
const P2pServer = require("./p2p");
const Wallet = require("../wallet");
const TransactionPool = require("../wallet/transaction-pool");
const Miner = require("./miner");

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app = express();

const wallet = new Wallet();
const blockchain = new BlockChain();
const transactionPool = new TransactionPool();
const p2pServer = new P2pServer(blockchain, transactionPool);
const miner = new Miner({ blockchain, transactionPool, wallet, p2pServer });

app.use(bodyParser.json());

app.get("/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/mine", (req, res) => {
  const { data } = req.body;
  const block = blockchain.addBlock(data);

  console.log(`New block added: ${block.toString()}`);

  p2pServer.syncChains();
  res.redirect("/blocks");
});

app.get("/transactions", (req, res) => {
  res.json(transactionPool.transactions);
});

app.post("/transact", (req, res) => {
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction({
    recipient,
    amount,
    blockchain,
    transactionPool,
  });

  p2pServer.broadcastTransaction(transaction);
  res.redirect("/transactions");
});

app.get("/public-key", (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

app.get("/mine-transactions", (req, res) => {
  const block = miner.mine();
  console.log(`New block added: ${block.toString()}`);
  res.redirect("/blocks");
});

app.listen(HTTP_PORT, () => {
  console.log(`Listening on port ${HTTP_PORT}`);
});
p2pServer.listen();
