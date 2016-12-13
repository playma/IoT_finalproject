// 載入 server 程式需要的相關套件
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var mongoose = require('mongoose')
var request = require('request');

// 載入設定
var config = require('./config')

var port = process.env.PORT || 8080

// 套用 middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))


app.get('/', function (req, res) {
  res.send('Hi, The API is at http://localhost:' + port + '/api')
})

var api = express.Router()

api.get('/', function (req, res) {
  res.json({message: 'Welcome to the APIs'})
})

api.get('/getSleepData', function (req, res) {
  request.get(`${config.host}:${config.sleeping_port}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/curtain/:switch', function (req, res) {
  request.post(`${config.host}:${config.curtain_port}`, {form:{switch:req.params.switch}}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/light/:light/:switch', function (req, res) {
  request.post(`${config.host}:${config.light_port[req.params.light]}`, {form:{switch:req.params.switch}}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/brightness', function (req, res) {
  request.get(`${config.host}:${config.brightness}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.post('/pressure', function (req, res) {
  res.send(req.body);
  //http://127.0.0.1:8080/api/light/0/on
  /*
  request.get(`${config.host}:${port}/api/light/0/${req.params.switch}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
  */
})

app.use('/api', api);

app.listen(port, function () {
  console.log('The server is running at http://localhost:' + port)
})
