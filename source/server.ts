import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import mongoose from 'mongoose';
import tokenRoutes from './routes/tokens';

const NAMESPACE = 'Server';
const router = express();

/** MONGO */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info(NAMESPACE, 'Mongo Connected');
    })
    .catch((error) => {
        logging.error(NAMESPACE, error.message, error);
    });

/** LOG */
router.use((req, res, next) => {
    /** REQ */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** RES */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** PARSE REQUEST BODY */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/** REST API, CORS */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** API ROUTES */
router.use('/api/', tokenRoutes);

/** ERROR */
router.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

// HTTP Server
const httpServer = http.createServer(router);

// WEB3
const Web3 = require('web3');
const web3 = new Web3(config.server.infuraurl);

// UniswapV2Factory Contract
const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const factoryAbi = require('./abi/uniswap-V2-factory-abi.js');
const erc20abi = require('./abi/erc20-abi.js');

var uniswapV2FactoryContract = new web3.eth.Contract(factoryAbi, factoryAddress);

// Check for PairCreated Events
uniswapV2FactoryContract.events
    .PairCreated({})
    .on('data', async function (event: any) {
        logging.info(NAMESPACE, event);
        const token0 = new web3.eth.Contract(erc20abi, event.returnValues.token0);
        const token1 = new web3.eth.Contract(erc20abi, event.returnValues.token1);
        logging.info(NAMESPACE, `New pair on Uniswap V2: ${await token0.methods.symbol().call()} ${event.returnValues.token0} - ${await token1.methods.symbol().call()} ${event.returnValues.token1}!`);
    })
    .on('error', console.error);

httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running on ${config.server.hostname}:${config.server.port}`));
