import dotenv from 'dotenv';

dotenv.config();

const MONGO_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 50,
    autoIndex: false,
    retryWrites: false
};

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'admin';
const MONGO_PASSWORD = process.env.MONGO_USERNAME || 'admin123';
const MONGO_HOST = process.env.MONGO_URL || 'uniswappairs.fljcl.mongodb.net/UniswapPairs';
const INFURA_HOST = process.env.INFURA_HOST || 'wss://mainnet.infura.io/ws/v3/99cca66bff404bdaa272dcc7ab29a94c';

const MONGO = {
    host: MONGO_HOST,
    password: MONGO_PASSWORD,
    username: MONGO_USERNAME,
    options: MONGO_OPTIONS,
    url: `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || 8080;

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT,
    infuraurl: INFURA_HOST
};

const config = {
    mongo: MONGO,
    server: SERVER
};

export default config;
