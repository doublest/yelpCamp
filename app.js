const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const catchAsynch = require ('./utils/catchAsynch');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override');
const {response} = require("express");
const morgan = require('morgan');
const port = 3000;

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser:true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('Database connected');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use((re, res, next) => {
    const reguestTime = Date.now();
    next();
} )

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

app.get('/', (req, res) => {
    res.render('home');
})

//Index Page for all Campgrounds
app.get('/campgrounds', catchAsynch(async (req, res) => {
    const campgrounds =  await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});

app.post('/campgrounds', validateCampground, catchAsynch(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = await new Campground(req.body.campground);
    await campground.save();
    console.log('new Campground saved to database');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Show Page for each Campground
app.get('/campgrounds/:id', catchAsynch(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsynch(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsynch(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id',  catchAsynch( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsynch(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found, 404'));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', { err });
});

app.listen(port, () => {
    console.log(`YelCamp Server hast started on PORT: ${port}`);
})
