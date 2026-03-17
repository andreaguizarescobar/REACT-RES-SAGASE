import { connect } from 'mongoose';
import config from './config.js';

(async () => { 
    try { 
        const db = await connect(config.CONNECTION_STRING, { 
    dbName: config.DATABASE 
}); 
console.log('Database is connected to: ', db.connection.name);
    } catch (error) { 
        console.log('Error: ', error); 
    } 
})();