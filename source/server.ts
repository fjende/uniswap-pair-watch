import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import mongoose, { Error } from 'mongoose';
import tokenRoutes from './routes/tokens';
import IEvent from './interface/event';
import { refreshProvider } from './web3js/refreshProvider';

const NAMESPACE = 'Server';
const router = express();
const axios = require('axios');

/** Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then(() => {
        logging.info('DB', `Remote MongoDB Connected on ${config.mongo.host}`);
    })
    .catch((error) => {
        logging.error('DB', error.message, error);
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
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `REST API Server is running on ${config.server.hostname}:${config.server.port}`));

// WEB3
const Web3 = require('web3');
const web3 = new Web3();
var provider = refreshProvider(web3, config.server.infuraurl);

provider.on('error', () => {
    logging.warn('Web3js', 'Web3 Websocket Provider lost connection, trying to reconnect');
    provider = refreshProvider(web3, config.server.infuraurl);
});

provider.on('end', () => {
    logging.warn('Web3js', 'Web3 Websocket Provider lost connection, trying to reconnect');
    provider = refreshProvider(web3, config.server.infuraurl);
});

// UniswapV2Factory Contract
const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';
const factoryAbi = require('./abi/uniswap-V2-factory-abi.js');
const erc20abi = require('./abi/erc20-abi.js');

var uniswapV2FactoryContract = new web3.eth.Contract(factoryAbi, factoryAddress);

// Check for PairCreated Events
uniswapV2FactoryContract.events
    .PairCreated({})
    .on('data', async function (event: IEvent) {
        const token0 = await new web3.eth.Contract(erc20abi, event.returnValues.token0);
        const token1 = await new web3.eth.Contract(erc20abi, event.returnValues.token1);
        const token0Symbol = await token0.methods.symbol().call();
        const token1Symbol = await token1.methods.symbol().call();
        // Check if it's a WETH Pair
        if (token0Symbol === 'WETH' || token1Symbol === 'WETH') {
            logging.info('Contract', `Detected new WETH pair on Uniswap V2: ${token0Symbol} ${event.returnValues.token0} - ${token1Symbol} ${event.returnValues.token1}!`);
            // Add to Database
            var newToken = token0Symbol === 'WETH' ? token1Symbol : token0Symbol;
            axios
                .post(`${config.server.hostname}::${config.server.port}/api/token`, {
                    name: newToken
                })
                .catch(function (error: Error) {
                    logging.error('Axios', error.message, error);
                });
        } else {
            logging.info('Contract', `New Pair Detected ${token0Symbol} - ${token1Symbol}, but I'm skipping because its not a WETH pair`);
        }
    })
    .on('error', async function (error: Error) {
        logging.error('Contract', error.message, error);
    });
