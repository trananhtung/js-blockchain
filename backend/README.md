# HOW TO RUN

## 1. Install dependencies
```
npm install
```

## 2. Run the app
```
npm run start-peer1
npm run start-peer2
npm run start-peer3
```

## 3. API
```
GET /blocks - get all blocks
GET /transactions - get all transactions
GET /public-key - get public key
GET /balance - get balance
GET /mine-transactions - mine transactions

POST /transact - create transaction
{
  "recipient": "public key",
  "amount": 100
}
