/**
 * return diff of to object based on flickerId
 * @param  {Array} a base array
 * @param  {Array} b array to compare
 * @return {Array}   return object only in A array
 */
exports.photosDiff = function(a, b) {
    var onlyInA = a.filter(function(current){
        return b.filter(function(current_b){
            return current_b.flickrId == current.flickrId;
        }).length == 0
    });

    return onlyInA;
};