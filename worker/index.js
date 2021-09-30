const redis = require('redis');
const keys = require('./keys');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisSub = redisClient.duplicate();

const calculateFib = index => {
    if (index < 2) return 1;
    return calculateFib(index-1) + calculateFib(index-2);
}

redisSub.on('message', (channel, message)=> {
    console.log("LIstener triggered : ", message);
    redisClient.hset('values', message, calculateFib(parseInt(message)));
});

redisSub.subscribe('insert');
