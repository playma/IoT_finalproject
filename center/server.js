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
  request.get(`${config.host}:${config.sleeping_port}/api/data`, function (error, response, body) {
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
  // 0:藍燈, 1:黃燈(臥室燈), 2:黃燈(廁所燈)
  // console.log(`${config.post_host}/digital/${light}/${req.params.switch}`)
  request.get(`${config.post_host}/digital/${light}/${req.params.switch}`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body)
    } else {
      res.send(error)
    }
  })
})

/**********************************/
/* API for app
/**********************************/

api.get('/getUp', function (req, res) {
  getUp();
  console.log('###### App call getUp API ######')
  res.send('getUp API')
  /*
  console.log(`${config.host}:${port}/api/curtain/1`)
  request.get(`${config.host}:${port}/api/curtain/1`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('###### App call getUp API ######')
      getUp();
      res.send('getUp API')
    } else {
      res.send(error)
    }
  })
  */
})

api.get('/goToSleep', function (req, res) {
  goToSleep();
  console.log('###### App call goToSleep API ######')
  res.send('goToSleep API')
  /*
  console.log(`${config.host}:${port}/api/curtain/0`)
  request.get(`${config.host}:${port}/api/curtain/0`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('###### App call goToSleep API ######')
      goToSleep();
      res.send('goToSleep API')
    } else {
      res.send(error)
    }
  })*/
})

api.get('/lavatories', function (req, res) {
  console.log(`${config.host}:${port}/api/light/0/1`)
  request.get(`${config.host}:${port}/api/light/0/1`, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('###### App call lavatories API ######')
      res.send('lavatories API')
    } else {
      res.send(error)
    }
  })
})

/**********************************/
/* method
/**********************************/

function turnOnlight(light) {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/light/${light}/1`, function (error, response, body) {
      console.log(`## Light${light} is on`);
      resolve(body);
    })
  });
}

function turnOfflight(light) {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/${light}/0/0`, function (error, response, body) {
      console.log(`## Light${light} is off`);
      resolve(body);
    })
  });
}

function getPressure() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/pressure`, function (error, response, body) {
      console.log(`## Pressure is ${body}`);
      resolve(body);
    })
  });
}

function getBrightness() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/brightness`, function (error, response, body) {
      console.log(`## Brightness is ${body}`);
      resolve(body);
    })
  });
}

function openCurtain() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/curtain/1`, function (error, response, body) {
      console.log(`## Curtain is open`);
      resolve(body);
    })
  });
}

function closeCurtain() {
  return new Promise(function(resolve, reject) {
    request.get(`${config.host}:${port}/api/curtain/0`, function (error, response, body) {
      console.log(`## Curtain is close`);
      resolve(body);
    })
  });
}

function closeMonitor() {
    clearInterval(monitor);
}

function setMonitor() {
  var light_now = false;
  monitor = setInterval(function(){
    //監控壓力
    getPressure().then(function(res) {
      if(res < 880) {
        //有壓力
        console.log('## Detection Pressure')
        turnOnlight(2).then(function() {
          light_now = true;
        });
      } else {
        console.log('## Detection no Pressure')
        if(light_now) {
          console.log('Turn off the light');
          turnOfflight(2).then(function() {
            light_now = false;
          });
        }
      }
    });
  }, 2000);
}

/**********************************/
/* 邏輯
/**********************************/

function getUp() {
  openCurtain().then(function() {
    getBrightness().then(function(res) {
      if(res > 350) {
        console.log('## Too dark, need open the light')
        turnOnlight(1);
      } else {
        console.log('## Light enough')
      }
    });
  });
}

function goToSleep() {
  closeCurtain().then(function() {
    turnOfflight(0);
    setTimeout(function() {
      turnOfflight(1)
    }, 10000);
    setMonitor();
  });
}

app.use('/api', api);

app.listen(port, function () {
  console.log('The server is running at http://localhost:' + port)
})
