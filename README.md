# uniswap-pair-watch

Scans uniswap factory contract for pairCreated events, logs it into remote mongoDB.

## install

1. clone the repo
2. `cd` into the repo
3. run `npm i` to install the dependencies (maybe I forgot to add some globaly installed ones :))

## usage

1. from the root of the repo directory `npm run detector` will run `server.js
2. if you want to check database status you can send a GET request (i.e via POSTMAN) to localhost:8080/api/tokens

## example output

what your terminal should roughly look like after running `npm run detector`

```

> \uniswap-pair-watch> npm run detector

[2021-02-17T14:27:50.915Z] [INFO] [Web3js] Web3 Websocket Provider initiated on wss://mainnet.infura.io/ws/v3/99cca66bff404bdaa272dcc7ab29a94c
[2021-02-17T14:27:50.931Z] [INFO] [Server] REST API Server is running on localhost:8080
[2021-02-17T14:27:51.439Z] [INFO] [DB] Remote MongoDB Connected on uniswappairs.fljcl.mongodb.net/UniswapPairs
[2021-02-17T14:31:12.175Z] [INFO] [Contract] Detected new WETH pair on Uniswap V2: VSP 0x1b40183EFB4Dd766f11bDa7A7c3AD8982e998421 - WETH 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2!
[2021-02-17T14:31:12.195Z] [INFO] [Server] [Request] - METHOD: [POST] - URL: [/api/token]
[2021-02-17T14:31:12.499Z] [INFO] [Server] [Response] - METHOD: [POST] - URL: [/api/token] - STATUS: [201]

```

## disclaimers

infura.io has some issue with kicking idle nodes, if ur using ur own node this should work fine. I'm looking for ways to fix it in the meantime.
