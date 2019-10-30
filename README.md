# redisfulltextsearch
## A redisearch implementation using nodejs
REDISEARCH USING CLI

#### Setup
```bash
git clone https://github.com/RediSearch/RediSearch.git
cd RediSearch
mkdir build
cd build
cmake .. -DCMAKE_BUILD_TYPE=RelWithDebInfo
make
redis-server --loadmodule ./redisearch.so
```
#### Getting Started

```bash
127.0.0.1:6379> FT.CREATE myIdx SCHEMA title TEXT WEIGHT 5.0 body TEXT url TEXT //CREATING SCHEMA
127.0.0.1:6379> FT.ADD myIdx doc1 1.0 FIELDS title "hello world" body "lorem ipsum" url "http://redis.io" // ADDING FIELDS
127.0.0.1:6379> FT.SEARCH myIdx "hello world" LIMIT 0 10 // FULL TEXT SEARCH ON INDEX myIdx 
1) (integer) 1
2) "doc1"
3) 1) "title"
   2) "hello world"
   3) "body"
   4) "lorem ipsum"
   5) "url"
   6) "http://redis.io”
127.0.0.1:6379> FT.DROP myIdx  // DROP INDEX 
127.0.0.1:6379> FT.SUGADD autocomplete "hello world" 1 //AUTOCOMPLETE SUGGESTIONS
127.0.0.1:6379> FT.SUGGET autocomplete "he" // RESULT
    1) "hello world"
```

#### REDISEARCH USING NODE.JS

RedRediSearch is a Node.js wrapper library or client for the rediSearch Redis module. It is more-or-less syntactically compatible with Reds, another Node.js search library.  
RedRediSearch and RediSearch can provide full-text searching that is much faster than the original Reds library.

First, we have to Setup the connection and load the required module as we have done in the above section.

[Command reference](https://oss.redislabs.com/redisearch/Commands.html)

[Repo link](https://github.com/expedite-atul/redisFullTextSearch)

### USAGE 
```javascript

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

```
