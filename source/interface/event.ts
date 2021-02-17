import { raw } from 'body-parser';

export default interface IEvent extends Object {
    event: String;
    signature?: String;
    adress: String;
    returnValues: {
        token0: string;
        token1: string;
    };
    logIndex: Number;
    transactionIndex: Number;
    transactionHash: String;
    blockHash: String;
    blockNumber: Number;
    raw: Object;
}
