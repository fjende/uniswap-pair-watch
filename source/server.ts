import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import mongoose, { Error } from 'mongoose';
import tokenRoutes from './routes/tokens';
import IEvent from './interface/event';

const NAMESPACE = 'Server';
const router = express();
const axios = require('axios');

/** Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then(() => {
        logging.info(NAMESPACE, 'MongoDB Connected');
    })
    .catch((error) => {
        logging.error(NAMESPACE, error.message, error);
    });

/** Logging */
router.use((req, res, next) => {
    /** Server Request */
    logging.info(NAMESPACE, `[Request] - METHOD: [${req.method}] - URL: [${req.url}]`);

    res.on('finish', () => {
        /** Server Response */
        logging.info(NAMESPACE, `[Response] - METHOD: [${req.method}] - URL: [/api${req.url}] - STATUS: [${res.statusCode}]`);
    });

    next();
});

/** Parse Req Body */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/** Rest Api, Cors */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Api Routes*/
router.use('/api/', tokenRoutes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

// HTTP Server
const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running on ${config.server.hostname}:${config.server.port}`));

// WEB3
const Web3 = require('web3');
const options = {
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};
const web3 = new Web3(new Web3.providers.WebsocketProvider(config.server.infuraurl, options));

// UniswapV2Factory Contract
const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const factoryAbi = require('./abi/uniswap-V2-factory-abi.js');
const erc20abi = require('./abi/erc20-abi.js');

var uniswapV2FactoryContract = new web3.eth.Contract(factoryAbi, factoryAddress);

// Check for PairCreated Events
uniswapV2FactoryContract.events
    .PairCreated({})
    .on('data', async function (event: IEvent) {
        const token0 = new web3.eth.Contract(erc20abi, event.returnValues.token0);
        const token1 = new web3.eth.Contract(erc20abi, event.returnValues.token1);
        const token0Symbol = await token0.methods.symbol().call();
        const token1Symbol = await token1.methods.symbol().call();
        // Check if it's a WETH Pair
        if (token0Symbol === 'WETH' || token1Symbol === 'WETH') {
            logging.info(NAMESPACE, `Detected new WETH pair on Uniswap V2: ${token0Symbol} ${event.returnValues.token0} - ${token1Symbol} ${event.returnValues.token1}!`);
            // Add to Database
            var newToken = token0Symbol === 'WETH' ? token1Symbol : token0Symbol;
            axios
                .post(`${config.server.hostname}::${config.server.port}/api/token`, {
                    name: newToken
                })
                .catch(function (error: Error) {
                    logging.error(NAMESPACE, error.message, error);
                });
        } else {
            logging.info(NAMESPACE, `New Pair Detected ${token0Symbol} - ${token1Symbol}, but I'm skipping because its not a WETH pair`);
        }
    })
    .on('error', console.error);
