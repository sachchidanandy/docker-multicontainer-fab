const keys = require('./keys');

const express = require('express');
const redis = require('redis');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');

// Configure Express server
const app = express();
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json());

// Configure pg
const pgClient = new Pool({
    user: keys.pgUserName,
    password: keys.pgPassword,
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
});
pgClient.on('error', (err) => console.error('Error while creating connection :', err.stack))
pgClient.on('connect', (client) => {
  client
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error('Error while creating table :',err.stack));
});

// Configure redis
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * from values");

  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  redisClient.hset("values", index, "Nothing yet!");

  redisPublisher.publish("insert", index);

  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Listening at port 5000");
});