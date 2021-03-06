'use strict';

const fs = require('fs');
const path = require('path');

const getFlights = require('./getFlights');
const delayDetector = require('./delayDetector');

const TIMETABLES_URL = 'http://www.kefairport.is/English/Timetables';

const scrape = (type, db) => {
  const url = `${TIMETABLES_URL}/${type}/`;
  console.log(new Date(), `Fetching ${type}`);
  getFlights(`${url}/yesterday`, [])
    .then((flights) => getFlights(url, flights))
    .then((flights) => getFlights(`${url}/tomorrow`, flights))
    .then((flights) => flights.map((flight) => delayDetector(flight)))
    .then((flights) => {
      // Write flights to disk
      try {
        fs.accessSync(path.join(__dirname, `../cache/${type}.json`), fs.F_OK);
        fs.rename(path.join(__dirname, `../cache/${type}.json`), path.join(__dirname, `../cache/${type}-old.json`));
      } catch (e) {
        // XXX Log error
      }
      fs.writeFile(path.join(__dirname, `../cache/${type}.json`), JSON.stringify(flights));

      // Post flights to Firebase
      const firebaseClient = db.ref(`/${type}`);
      firebaseClient.set(flights);
      console.log(new Date(), `Finished fetching ${type}`);
    });
};

module.exports = (db) => {
  try {
    fs.mkdirSync(path.join(__dirname, '../cache'));
  } catch (e) {
    // cache folder exists
  }

  scrape('arrivals', db);
  scrape('departures', db);

  // Scrape and update data every 2 minutes
  setInterval(() => scrape('arrivals', db), 60000);
  setInterval(() => scrape('departures', db), 60000);

  console.log(new Date(), 'Scraper running');
};
