const EC = require("elliptic").ec;

const ec = new EC("secp256k1");

const generateKeyPair = () => {
  return ec.genKeyPair();
};

const verifySignature = ({ publicKey, dataHash, signature }) => {
  return ec.keyFromPublic(publicKey, "hex").verify(dataHash, signature);
};

module.exports = {
  generateKeyPair,
  verifySignature,
};
