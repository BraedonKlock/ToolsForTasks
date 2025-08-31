/**
 * This file is the entry point of the web app and handles entry points to routes
 */

/**Dependancy imports */
const express = require('express'); // importing express
const bodyParser = require('body-parser'); // importing body parser to parse raw binary data 
const path = require('path'); // importing path so that paths work on linux OS
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

/**File imports */
const db = require('./util/database'); // importing the database
const homeRoute = require('./routes/home');
const ownerRoutes = require('./routes/owner'); // importing owner.js from routes
const foremanRoutes = require('./routes/foreman'); // importing foreman.js from routes 
const crewRoutes = require('./routes/crew'); // importing crew.js from routes

const app = express(); // creating an express object that acts like a server and router

const store = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: 'Kloc0004',
  database: 'tools_for_tasks',
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000
});

/**ExpressJS settings */
app.set('view engine', 'ejs'); // setting the servers view to ejs 
app.set('views', 'views'); // setting the view path to the views folder

/** */
app.use(bodyParser.urlencoded({ extended: false })); // using body-parser to parse raw data
app.use(express.static(path.join(__dirname, 'public'))); // importing css files

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  store,
  name: 'tft.sid',
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.get('/session-test', (req, res) => {
  req.session.views = (req.session.views || 0) + 1;
  res.send(`Views in this session: ${req.session.views}`);
});

/**calls to routers */
app.use('/', homeRoute); // home routes
app.use('/owner', ownerRoutes); // owner routes
app.use('/foreman', foremanRoutes);// foreman routes
app.use('/crew', crewRoutes); // crew routes

/**Server binding */
app.listen(3000); // binding server to port 3000