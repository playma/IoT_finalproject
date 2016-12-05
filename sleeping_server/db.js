var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var file = "./sleep.db";
var db = new sqlite3.Database(file);

function getSleepData(res) {
    db.all("SELECT * FROM Sleeping", function(err, data) {
        res.send(data);
    });
}

function fallAsleep(res) {
  db.serialize(function() {
    var date = new Date();
    db.run("INSERT INTO Sleeping VALUES (?, ?)", [date, 'fallAsleep'], function() {
      res.send(this);
    });
  });
}

function getUp(res) {
  db.serialize(function() {
    var date = new Date();
    db.run("INSERT INTO Sleeping VALUES (?, ?)", [date, 'getUp'], function() {
      res.send(this);
    });
  });
}

function delSleepData(res) {
  db.serialize(function() {
    db.run("DELETE FROM Sleeping", function() {
      res.send(this);
    });
  });
}

module.exports = {
    getSleepData: function(req, res, next) {
        getSleepData(res);
    },
    fallAsleep: function(req, res, next) {
        fallAsleep(res);
    },
    getUp: function(req, res, next) {
        getUp(res);
    },
    delSleepData: function(req, res, next) {
        delSleepData(res);
    }
}
