const getPageNotFound = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Founds',
    path: '/not-found'
  });
};

module.exports = { getPageNotFound };
