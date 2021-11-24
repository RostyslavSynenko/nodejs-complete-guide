const getPageNotFound = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page Not Founds',
    path: '/not-found'
  });
};

const get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '500'
  });
};

module.exports = { getPageNotFound, get500 };
