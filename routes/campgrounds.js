const express = require('express');
const router = express.Router();
const catchAsynch = require ('../utils/catchAsynch');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

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
router.get('/new', (req, res) => {
    res.render('campgrounds/new')
});

router.post('/', validateCampground, catchAsynch(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = await new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully made a new campground');
    console.log('new Campground saved to database');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Show Page for each Campground
router.get('/:id', catchAsynch(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if(!campground) {
        req.flash('error', 'Cannot find campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

router.get('/:id/edit', catchAsynch(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground) {
        req.flash('error', 'Cannot update campground');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

router.put('/:id', validateCampground, catchAsynch(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
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
