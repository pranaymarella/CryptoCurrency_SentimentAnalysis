const Twitter = require('twitter');

// Twitter API Credentials
const twitter_consumer_key = 'kV93DxhPzYVXsS9UotpOwwKC6';
const twitter_consumer_secret = 'DoOKg4EIE5sQ6m9wL6kxyMKvcPzW8rLVZHpLLzuB0EsysNKHyb';
const access_token = '846191975804141569-sLWEfs4JY0wYfFPZU7f2NAKCDIIRm6u';
const access_secret = 'gyacPUDpDVH8hgjhWc2RNaZ7Z5qyCfOYcceWISkPk4JJw';

// Connect to Twitter
var client = new Twitter({
    consumer_key: twitter_consumer_key,
    consumer_secret: twitter_consumer_secret,
    access_token_key: access_token,
    access_token_secret: access_secret
});

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
client.stream('statuses/filter', {track: 'twitter'},  function(stream) {
  stream.on('data', function(tweet) {
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
