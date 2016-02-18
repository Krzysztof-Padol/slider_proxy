
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * User schema
 */

var QuerySchema = new Schema({
  searchText: { type: String, default: '' },
  page: { type: Number, default: 1 },
  pages: { type: Number, default: 1 },
  perpage: { type: Number, default: 1 },
  total: { type: String, default: '' },
  maxDate: { type: Date, default: Date.now },
  photo: [ {type : mongoose.Schema.ObjectId, ref : 'Photo'} ]
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

QuerySchema.method({

});

/**
 * Statics
 */

QuerySchema.static({

});

/**
 * Register
 */

mongoose.model('Query', QuerySchema);
