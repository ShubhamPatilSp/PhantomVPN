const mongoose = require('mongoose');
const { Connection } = require('./src/models/index');
const Server = require('./src/models/Server.model');
require('dotenv').config();

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:51347/phantomvpn_test?directConnection=true&serverSelectionTimeoutMS=2000'); // Actually, I don't know the exact mongo URI! Node's memory server uses a random port!
  
  // Oh right the memory server port is random and printed when server js starts... 
}
run();
