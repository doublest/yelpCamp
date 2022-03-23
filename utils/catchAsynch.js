//Wrapper function to catch errors in asynch functions
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}
