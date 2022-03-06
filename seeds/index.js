const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {places, descriptors} = require('./seedHelpers')
const cities = require('./cities');

//connect to the MongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser:true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

//delete everything in the DB, to have a plain start
const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        //there are 1000 cities in the array
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}
//execute and seed the database with data, and close the connection at the end!
seedDB().then(() => {
    mongoose.connection.close();
});
