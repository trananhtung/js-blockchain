const Websocket = require("ws");

const MESSAGE_TYPES = {
  chain: "CHAIN",
  transaction: "TRANSACTION",
  clearTransactions: "CLEAR_TRANSACTIONS",
};

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

class P2pServer {
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];
  }

  listen() {
    const server = new Websocket.Server({ port: P2P_PORT });
    server.on("connection", (socket) => this.connectSocket(socket));
    this.connectToPeers();
    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
  }

  connectToPeers() {
    peers.forEach((peer) => {
      const socket = new Websocket(peer);
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain,
      }),
    );
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log(`Socket connected ${socket.url}`);

    this.messageHandler(socket);

    this.sendChain(socket);
  }

  messageHandler(socket) {
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clearTransactions:
          this.transactionPool.clear();
          break;
        default:
          break;
      }
    });
  }

  syncChains() {
    this.sockets.forEach((socket) => this.sendChain(socket));
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.transaction,
          transaction,
        }),
      ),
    );
  }

  broadcastClearTransactions() {
    this.sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.clearTransactions,
        }),
      ),
    );
  }
}

module.exports = P2pServer;
