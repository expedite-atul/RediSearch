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
(() => {
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
      // search strs with str
      search.query(argv.query).end((err, ids) => {
        let res = ids.map((i) => strs[i]);
        // console.log(`Search results for ${argv.query}`);
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

/**
 * add and get suggestions
 */
(() => {
  try {
    let suggestions = redsearch.suggestionList('my-suggestion-list');
    suggestions.add(
      'redis',
      2,
      function (err, sizeOfSuggestionList) { /* ... */ }
    );
    suggestions.add(
      'redisearch',
      5,
      function (err, sizeOfSuggestionList) { /* ... */ }
    );
    suggestions.add(
      'reds',
      1,
      function (err, sizeOfSuggestionList) { /* ... */ }
    );
    suggestions.add(
      'redredisearch',
      1,
      function (err, sizeOfSuggestionList) { /* ... */
        if (err) throw err;
        console.log('totalResults', sizeOfSuggestionList)
      }
    );
    // suggestions.get
    suggestions.get(
      're',
      function (err, result) {
        if (err) throw err;
        console.log('re suggestion', result);
      }
    );
    suggestions.get(
      'redis',
      function (err, returnedSuggestions) {
        console.log('redis suggestion', returnedSuggestions);
      }
    )
    suggestions.get(
      'atul',
      function (err, returnedSuggestions) {
        console.log('atul suggestion', returnedSuggestions);
      }
    )
  } catch (error) { console.log(error) }
})();