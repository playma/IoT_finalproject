module.exports = {
  'database': 'mongodb://localhost/jwt_dev',

  'host': 'http://127.0.0.1',
  'port': 8080,
  'get_host': 'http://172.20.10.14/arduino/analog',
  'post_host': 'http://172.20.10.3/arduino',
  'brightness_port': 1234,  //亮度感測器
  'pressure_port': 1239, //壓力感測器
  'curtain_port': 1235, //窗簾
  'light': [12, 6, 1],
  'sleeping_port': 8081 //睡眠手環
}
