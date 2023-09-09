const { v1: uuidv1 } = require("uuid");
const SHA256 = require("crypto-js/sha256");

const generateId = () => uuidv1();

const hashSHA256 = (data) => SHA256(JSON.stringify(data)).toString();

module.exports = { generateId, hashSHA256 };
