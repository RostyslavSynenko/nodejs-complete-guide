const getPageNotFound = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Founds',
    path: '/not-found',
    isAuthenticated: req.session.isLoggedIn
  });
};

module.exports = { getPageNotFound };
