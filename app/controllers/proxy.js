var flickr = require('./../helpers/flickr');
var time = require('./../helpers/time');

var util = require('util');

/*!
 * Module dependencies.
 */

exports.index = function (req, res) {
  res.render('home/index', {
    title: 'Flickr proxy example'
  });
};

exports.search = function (req, res, next) {
  // Params validation
  req.checkQuery('text', 'Invalid getparam').notEmpty();
  req.checkQuery('page', 'Invalid getparam').isInt();
  req.checkQuery('per_page', 'Invalid getparam').isInt();

  // return if something is wrong with validation
  var errors = req.validationErrors();
  if (errors) {
    res.send('There have been validation errors: ' + util.inspect(errors), 400);
    return;
  }

  var photosJSON; 
  var refs = [];

  var searchText = req.query.text;
  var page = req.query.page;
  var perPage = req.query.per_page;
  var maxDate = time.getLastDayTimestamp();

  flickr.search(searchText, page, perPage, maxDate)
    .then((photos) => {
      res.json(photos);
    })
    .catch(next);
};
