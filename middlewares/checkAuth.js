
module.exports =  function (req, res, next) {
    if (!req.session.email) {
        return res.redirect('/login');
    }
    next();
};