const express = require('express');
const router = express.Router({mergeParams: true});
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsynch = require ('../utils/catchAsynch');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');

router.post('/', validateReview, isLoggedIn, catchAsynch(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsynch(reviews.deleteReview));

module.exports = router;
