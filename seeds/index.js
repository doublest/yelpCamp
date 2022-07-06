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
    for (let i = 0; i < 400; i++) {
        //there are 1000 cities in the array
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) +10;
        const camp = new Campground({
            author: '62966ea07c21fd20203be06b',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed d',
            price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dgf4mahia/image/upload/v1655652854/YelpCamp/ql3aapbsdvbaklprkss0.jpg',
                    filename: 'YelpCamp/ql3aapbsdvbaklprkss0'
                },
                {
                    url: 'https://res.cloudinary.com/dgf4mahia/image/upload/v1655652855/YelpCamp/f9q0iorx85cd8lata77n.jpg',
                    filename: 'YelpCamp/f9q0iorx85cd8lata77n'
                }
            ]
        })
        await camp.save();
    }
}
//execute and seed the database with data, and close the connection at the end!
seedDB().then(() => {
    mongoose.connection.close();
})
