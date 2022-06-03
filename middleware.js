module.exports.isLoggedIn = (req, res, next) => {
   if(!req.isAuthenticated()) {
       req.session.returnTo = req.originalUrl;
       req.flash('error', 'you need to be logged in to create a new Campground');
       return res.redirect('/login');
    }
    next();
}
