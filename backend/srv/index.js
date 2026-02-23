import app from './app.js';
import config from './config/config.js';
app.listen(app.get('port'));
console.log(
  `Server is running on: http://${config.HOST}:${app.get('port')}${
    config.API_URL
  }`
);