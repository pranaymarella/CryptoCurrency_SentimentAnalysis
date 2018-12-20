# CryptoCurrency_SentimentAnalysis

Performs Simple Sentiment Analysis on Twitter Data of certain CryptoCurrencies. Users simply input a crypto of their choice in the `Search Crypto` box and the app sends a request to the backend to fetch data about this crypto. The backend uses the Twitter API to fetch tweets and runs sentiment analysis over them, and outputs the sentiment score. The backend also uses the Google Trends API, to fetch trends data about this crypto over the past year. The idea is to be able to predict the price movement of a certain cryptocurrency based on Twitter Chatter and how much a crypto has been searched on Google over time.

## What's Included

* Public
* Views
* App.js
* package.json
* README.md

## How to Run

* Open terminal and `cd` into the root of this folder
* Run `npm install` to install all dependencies
* Run `nodemon app.js` to run the application
* Open a web browser and go to `localhost:3000` to view the application
