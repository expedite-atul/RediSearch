const redis = require('redis');
const argv = require('yargs').argv; // to get -- query  text to be searched
const redsearch = require('..'); // require the redisearch module
const bluebird = require('bluebird');

const client = redis.createClient({
  host: 'localhost',
  port: 6379,
});

bluebird.promisifyAll(redis);
bluebird.promisifyAll(redsearch);

/**
 * array data to be indexed
 */
let strs = [];
strs.push('Manny is a cat');
strs.push('Luna is a cat');
strs.push('Tobi is a ferret');
strs.push('Loki is a ferret');
strs.push('Jane is a ferret');
strs.push('Jane is funny ferret');

/**
 * connection string
 */
(async () => {
  try {
    client.on('ready', () => console.log('Redis client is ready!'))
    redsearch.setClient(client);
    redsearch.confirmModule(() => console.log('RedSearch module loaded successfully'));
    // client.on('end', () => console.log('Tadaa! Redis connection is closed.'));
  } catch (error) {
    console.log(error);
  }
})();

/**
 * create Index and search by passing --query searchKey
 */
(async () => {
  try {
    redsearch.createSearch('searchTest', {}, (err, search) => {
      // indexing str arr
      strs.forEach(function (str, i) {
        search.index(str, i);
      });
      search.query(argv.query).end((err, ids) => {
        let res = ids.map((i) => strs[i]);
        console.log(`Search results for ${argv.query}`);
        res.forEach((str) => {
          console.log(`ft search result ------ ${str}`);
        });
      });
      client.quit();
    });
  } catch (error) {
    console.log(error);
  }
})();