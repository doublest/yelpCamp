const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsynch = require('../utils/catchAsynch');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsynch(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsynch(campgrounds.createNewCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsynch(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsynch(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsynch(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsynch(campgrounds.editCampground));

module.exports = router;
