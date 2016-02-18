var DAY_MILISECONDS = 1000 * 3600 * 24;

function roundDate(timeStamp){
    timeStamp -= timeStamp % (24 * 60 * 60 * 1000);//subtract amount of time since midnight
    timeStamp += new Date().getTimezoneOffset() * 60 * 1000;//add on the timezone offset
    return new Date(timeStamp);
}

exports.getLastDayTimestamp = function(a, b) {
    var now = new Date();

    return roundDate(now.getTime() - DAY_MILISECONDS).getTime() / 1000;
};