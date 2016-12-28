// 載入 server 程式需要的相關套件
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var mongoose = require('mongoose')
var request = require('request');

// 載入設定
var config = require('./config');

var port = process.env.PORT || 8080;

var monitor;

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

api.get('/brightness', function (req, res) {
  console.log(`${config.get_host}/22`)
  request.get(`${config.get_host}/22`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/pressure', function (req, res) {
  console.log(`${config.get_host}/18`)
  request.get(`${config.get_host}/18`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/curtain/:switch', function (req, res) {
  var arg = req.params.switch == 1?9:8;
  console.log(`${config.post_host}/servo/${arg}/1`);

  request.get(`${config.post_host}/servo/${arg}/1`, {form:{switch:req.params.switch}}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/light/:light/:switch', function (req, res) {
  light = config.light[req.params.light];

  console.log(`${config.post_host}/digital/${light}/${req.params.switch}`)
  request.get(`${config.post_host}/digital/${light}/${req.params.switch}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

api.get('/getUp', function (req, res) {
  console.log(`${config.host}:${port}/api/curtain/1`)
  request.get(`${config.host}:${port}/api/curtain/1`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      getUp();
      res.send('起床，打開窗簾')
    } else {
      res.send(error)
    }
  })
})

api.get('/goToSleep', function (req, res) {
  console.log(`${config.host}:${port}/api/curtain/0`)
  request.get(`${config.host}:${port}/api/curtain/0`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      goToSleep();
      res.send('睡覺了，關上窗簾')
    } else {
      res.send(error)
    }
  })
})

api.get('/lavatories', function (req, res) {
  console.log(`${config.host}:${port}/api/light/0/1`)
  request.get(`${config.host}:${port}/api/light/0/1`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send('上廁所，打開燈')
    } else {
      res.send(error)
    }
  })
})

function turnOnlight() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/light/0/1`, function (error, response, body) {
      console.log('## Light is on.');
      resolve(body);
    })
  });
}

function turnOfflight() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/light/0/0`, function (error, response, body) {
      resolve(body);
    })
  });
}

function getPressure() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/pressure`, function (error, response, body) {
      resolve(body);
    })
  });
}

function getBrightness() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/brightness`, function (error, response, body) {
      resolve(body);
    })
  });
}

function openCurtain() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/curtain/1`, function (error, response, body) {
      resolve(body);
    })
  });
}

function closeCurtain() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/curtain/0`, function (error, response, body) {
      resolve(body);
    })
  });
}

function getUp() {
  openCurtain().then(function() {
    getBrightness().then(function(res) {
      if(res > 350) {
        console.log(res + '太暗了，開燈')
        turnOnlight();
      } else {
        console.log(res + '燈光正常')
      }
    });
  });
}

function goToSleep() {
  closeCurtain().then(function() {
    turnOfflight();
    setMonitor();
  });
}

function closeMonitor() {
    clearInterval(monitor);
    monitor = 0;
}

function setMonitor() {
  var light_now = false;
  monitor = setInterval(function(){
    //監控壓力
    getPressure().then(function(res) {
      if(res < 880) {
        //有壓力
        console.log(res + '有壓力')
        console.log('Turn on the light');
        light_now = true;
        turnOnlight().then(function() {
          light_now = true;
        });
      } else {
        console.log(res + '正常')
        if(light_now) {
          console.log('Turn off the light');
          turnOfflight().then(function() {
            light_now = false;
          });
        }
      }
    });
  }, 2000);
}

app.use('/api', api);

app.listen(port, function () {
  console.log('The server is running at http://localhost:' + port)
})
