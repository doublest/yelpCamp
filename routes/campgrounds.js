const express = require('express');
const router = express.Router();
const catchAsynch = require ('../utils/catchAsynch');
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')
    .get(catchAsynch(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsynch(campgrounds.createNewCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(isLoggedIn, catchAsynch(campgrounds.showCampground))
    .put(validateCampground, isAuthor, catchAsynch(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsynch(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsynch(campgrounds.editCampground));

module.exports = router;
