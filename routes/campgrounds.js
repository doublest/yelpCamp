const express = require('express');
const router = express.Router();
const catchAsynch = require ('../utils/catchAsynch');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const passport = require('passport');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if(error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

//Index Page for all Campgrounds
router.get('/', catchAsynch(async (req, res) => {
    const campgrounds =  await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new')
});

router.post('/', isLoggedIn, validateCampground, catchAsynch(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = await new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    console.log('new Campground saved to database');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Show Page for each Campground
router.get('/:id', isLoggedIn, catchAsynch(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campground);
    if(!campground) {
        req.flash('error', 'Cannot find campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', isLoggedIn ,catchAsynch(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
        req.flash('error', 'Cannot update campground');
        return res.redirect('/campgrounds');
    }
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', "You do not have permission");
        return res.redirect(`/campgrounds/${id}`)
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsynch(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.body._id)) {
        req.flash('error', "You do not have permission");
        return res.redirect(`/campgrounds/${id}`)
    } else {
        const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    };
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id',  catchAsynch( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted campground');
    res.redirect('/campgrounds')
}));

module.exports = router;
