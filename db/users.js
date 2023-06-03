var records = [
  {
    id: 1,
    username: "lily",
    password: "H0tbunCafe666",
  },
  {
    id: 2,
    username: "chef",
    password: "cookcook",
  },
]; //to be replace by process.env


const findById = function (id, cb) {
  process.nextTick(function () {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error("User " + id + " does not exist"));
    }
  });
};

const findByUsername = function (username, cb) {
  process.nextTick(function () {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    console.log('wrong at user.js')
    return cb(null, null);
  });
};

module.exports = { findById, findByUsername }

