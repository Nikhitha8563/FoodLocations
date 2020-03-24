const mongoose = require('mongoose');
//const host = process.env.DB_HOST || '127.0.0.1'
//const dbURL = `mongodb://${host}/FoodLoc8r`;
//const dbURL = 'mongodb://heroku_lw1vmb3h:8tu07674nn2as556300iorchqn@ds147684.mlab.com:47684/heroku_lw1vmb3h';
const dbURL = 'mongodb+srv://FoodLoc8rUser:KCChiefs19!@foodloc8r-hg4y1.mongodb.net/FoodLoc8r';
const readLine = require('readline');

const connect = () => {
  setTimeout(() => mongoose.connect(dbURL, { useNewUrlParser: true, useCreateIndex: true }), 1000);
}

mongoose.connection.on('connected', () => {
    console.log('connected to ', dbURL);
});

mongoose.connection.on('error', err => {
  console.log('error: ' + err);
  return connect();
});

mongoose.connection.on('disconnected', () => {
  console.log('disconnected');
});

if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ('SIGINT', () => {
    process.emit("SIGINT");
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close( () => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});
process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});
process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

connect();

require('./locations');