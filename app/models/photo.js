
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var photosDiff = require('./../helpers/arrayDiff').photosDiff;

/**
 * User schema
 */

var PhotoSchema = new Schema({
  flickrId: { 
    type: String,
    required: true,
    index: true,
    unique: true 
  },
  owner: { type: String, default: '' },
  secret: { type: String, default: '' },
  server: { type: String, default: '' },
  farm: { type: Number, default: 1 },
  title: { type: String, default: '' },
  ispublic: { type: Number, default: 0 },
  isfriend: { type: Number, default: 0 },
  isfamily: { type: Number, default: 0 }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */


/**
 * Methods
 */

PhotoSchema.method({

});

/**
 * Statics
 */

PhotoSchema.static({
  /**
   * Mongoose doesnt have findOrCreate function so we have to use this one
   * @param  {Array}   photos Array of photos
   * @param  {Function} cb    mongoose callback
   * @return {Promise}        return promsie because we have to find
   *                          already created photos and create rest of them
   */
  findOrCreate: function (photos, cb) {
    var self = this;
    var photosToFind = [];
    var result = [];

    photos.forEach((obj) => {
      photosToFind.push(obj.flickrId || obj.id);  
    });

    var p1 = new Promise((resolve, reject) => {
      self.find({flickrId: { $in: photosToFind }}).exec()
        .then((items) => {
          var photosToCreate = photosDiff(photos, items);

          result = [].concat(items);

          return self.create(photosToCreate);
        }, reject)
        .then((createdItems) => {
          result = result.concat(createdItems);

          if(cb) {
            cb(undefined, result)
          }

          resolve(result);
        }, reject);
    });

    return p1;
  }
});

/**
 * Register
 */

mongoose.model('Photo', PhotoSchema);
