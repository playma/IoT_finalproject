// 載入 server 程式需要的相關套件
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var request = require('request');
var path = require("path");

var sqlite3 = require("sqlite3").verbose();
var file = "./sleep.db";
var db = require('./db');

// 載入設定
var config = require('./config')

var port = process.env.PORT || 8081

// 套用 middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/index.html'));
})

var api = express.Router()

api.get('/data', db.getSleepData)
api.get('/fallAsleep', db.fallAsleep)
api.get('/getUp', db.getUp)
api.get('/delSleepData', db.delSleepData)

app.use('/api', api);

app.listen(port, function () {
  console.log('The server is running at http://localhost:' + port)
})
