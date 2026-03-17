import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import config from './config/config.js';
import userRoutes from './routes/user.route.js';
await import('./config/db.js');
const app = express();
app.set('port', config.PORT);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const api = config.API_URL;
app.use(`${api}/users`, userRoutes);
console.log(`API URL: ${api}` + `, PORT: ${config.PORT}`);

export default app;