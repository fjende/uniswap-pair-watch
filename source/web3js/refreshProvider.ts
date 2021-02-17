import logging from '../config/logging';

/**
 * Refreshes provider instance and attaches even handlers to it
 */
const NAMESPACE = 'Web3js';
const Web3 = require('web3');
var web3 = new Web3();

export function refreshProvider(web3Obj: typeof Web3, providerUrl: string) {
    const provider = new Web3.providers.WebsocketProvider(providerUrl);

    web3Obj.setProvider(provider);

    logging.info(NAMESPACE, `Web3 Websocket Provider initiated on ${providerUrl}`);

    return provider;
}

export default web3;
