/**
 * Module dependencies.
 */
var request = require('request');
var mongoose = require('mongoose');
var Query = mongoose.model('Query');
var Photo = mongoose.model('Photo');

var https = require('https');
var API_KEY = require('config').flickr_api_key;

/**
 * Searching images in Flickr API
 * @param  {String} searchText searching text
 * @param  {Number} page       page
 * @param  {Number} perPage    items per page
 * @param  {Date}   maxDate    max date of upload images
 * @return {Promise}           Promise
 */
var searchAPI = function (searchText, page, perPage, maxDate) {
  var apiKey = API_KEY;
  var promise = new Promise((resolve, reject) => {
    var url = `\/services\/rest\/?method=flickr.photos.search&text=${searchText}&page=${page}&per_page=${perPage}&max_upload_date=${maxDate}&api_key=${apiKey}&format=json&nojsoncallback=1`; // the rest of the url with parameters if needed
    var options = {
        method: 'GET',
        url: 'https://api.flickr.com' + url,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };
    var callback = function(error, response, body) {
      var data;

      if (error) {
          console.log('error', error);
          reject(error)
          res.send(500, 'something went wrong');
      }

      try {
          data = JSON.parse(body);

          data.photos.photo.map(function (obj) {
            obj.flickrId = obj.id;
            delete obj.id;

            return obj;
          });
      } catch(e) {
          console.log('malformed request', body);
          reject(e)
          return res.status(400).send('malformed request: ' + body);
      }

      resolve(data);
    }

    request(options, callback);
  });

  return promise;
};

/**
 * Searching images in Flickr API and store
 * returned value in database for a future 
 * cache purpose
 * @param  {String} searchText searching text
 * @param  {Number} page       page
 * @param  {Number} perPage    items per page
 * @param  {Date}   maxDate    max date of upload images
 * @return {Promise}           Promise
 */
var storeSearchQuery = function(searchText, page, perPage, maxDate) {
  var photosJSON;
  var refs = [];

  var promise = new Promise((resolve, reject) => {
    //Get query from API
    searchAPI(searchText, page, perPage, maxDate)
      .then((photosRes) => {
        photosJSON = photosRes;

        return Photo.findOrCreate(photosRes.photos.photo);
      })
      .then(function saveQuery(foundedOrCreated) {
        //Collecting ID's of images
        if (foundedOrCreated) {
          foundedOrCreated.forEach((photo) => {
            if (photo && photo._id) {
              refs.push(photo._id);  
            }
          });
        }

        var query = new Query({
          searchText: searchText,
          page: photosJSON.photos.page,
          pages: photosJSON.photos.pages,
          perpage: photosJSON.photos.perpage,
          total: photosJSON.photos.total,
          maxDate: maxDate,
          photo: refs // Adding images to query
        });

        return query.save();
      })
      .then(function getSavedQuery(query) {
        console.log('jestem tutaj!!');
        return Query.findOne(query._id).populate('photo').exec();
      })
      .then(function returnValues(photos) {
        resolve({
          photos: photos,
          stat: 'ok'
        });
      })
      .catch(reject);
  });

  return promise;
};

/**
 * Searching using database if query was previously cached
 * if not we are going to use Flickr API and store values
 * in database for a future
 * @param  {String} searchText searching text
 * @param  {Number} page       page
 * @param  {Number} perPage    items per page
 * @param  {Date}   maxDate    max date of upload images
 * @return {Promise}           Promise
 */
var search = function (searchText, page, perPage, maxDate) {
  var promise = new Promise((resolve, reject) => {
    // Check if we already have saved query
    Query.findOne({
        searchText: searchText,
        page: page,
        perpage: perPage,
        maxDate: maxDate
      })
      .populate('photo')
      .exec()
      .then(function doWeHaveQueryInDB(query) {
        if (query) {
          console.log('HIT! to database!');

          resolve({
            photos: query,
            stat: 'ok'
          });
        } else {
          console.log('Getting images from Flickr');

          storeSearchQuery(searchText, page, perPage, maxDate)
            .then(resolve, reject)
        }
      }, reject)
  });

  return promise;
};

/**
 * Expose
 */
exports.search = search;
exports.searchAPI = searchAPI;
