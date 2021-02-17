import logging from '../config/logging';

/**
 * Refreshes provider instance and attaches even handlers to it
 */
const NAMESPACE = 'Web3js';
const Web3 = require('web3');
var web3 = new Web3();

export function refreshProvider(web3Obj: typeof Web3, providerUrl: string) {
    let retries = 0;

    function retry(event?: Event) {
        if (event) {
            logging.debug(NAMESPACE, 'Web3 provider disconnected or errored.');
            retries += 1;

            if (retries > 5) {
                logging.debug(NAMESPACE, `Max retries of 5 exceeding: ${retries} times tried`);
                return setTimeout(refreshProvider, 5000);
            }
        } else {
            logging.debug(NAMESPACE, `Reconnecting web3 provider ${providerUrl}`);
            refreshProvider(web3Obj, providerUrl);
        }

        return null;
    }

    const provider = new Web3.providers.WebsocketProvider(providerUrl);

    provider.on('end', () => retry());
    provider.on('error', () => retry());

    web3Obj.setProvider(provider);

    logging.info(NAMESPACE, `Web3 Websocket Provider initiated on ${providerUrl}`);

    return provider;
}

export default web3;
