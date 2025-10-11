/**
 * This file is the entry point of the web app and handles entry points to routes
 */

/**Dependancy imports */
const express = require('express'); // importing express
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser'); // importing body parser to parse raw binary data 
const path = require('path'); // importing path so that paths work on linux OS
const session = require('express-session'); // importing express sessions for user authentication
const MySQLStore = require('express-mysql-session')(session); // importing mysql session to store sessions in database
const csrf = require('@dr.pogodin/csurf'); // installing csrf to implement tokens to protect against attacks

/**File imports */
const db = require('./util/database'); // importing the database
const homeRoute = require('./routes/home'); // importing routes for not loggedin user
const loggedinRoutes = require('./routes/loggedin'); // importing loggedin.js from routes
const { requireLogin, branchLogIn, attachCsrfToken } = require('./middleware/auth');  // not '/middleware/auth'
const viewLocals = require('./middleware/viewLocals');
const errorHandler = require('./middleware/errorHandler');

const app = express(); // creating an express object thats a request handler
const server = http.createServer(app); // create the HTTP and pass the app as handler 
const io = new Server(server);

/**mysql store object for storing session data */
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

/**creating csrf object */
const csrfProtection = csrf();

/**ExpressJS settings */
app.set('view engine', 'ejs'); // setting the servers view to ejs 
app.set('views', 'views'); // setting the view path to the views folder

/** */
app.use(bodyParser.urlencoded({ extended: false })); // using body-parser to parse raw data
app.use(express.static(path.join(__dirname, 'public'))); // importing css files

/**Setting up session */
const sessionMiddleware = session({
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
});

app.use(sessionMiddleware);
app.use(csrfProtection);
app.use(attachCsrfToken);

const wrap = (mw) => (socket, next) => mw(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
app.set('io', io);

/**calls to routers */
app.use(viewLocals); // using locals for what the user sees in views files
app.use('/loggedin', requireLogin, loggedinRoutes); // loggedin user routes
app.use('/', branchLogIn, homeRoute); // home routes
app.use(errorHandler);

// socket.io handlers
io.on('connection', (socket) => {
  const sess = socket.request.session;
  if (!sess?.org || !sess?.role) return; // if no org or role in session return
  // Owners socket
  if (sess.role === 'owner') {
    socket.join(`org:${sess.org}`);
    console.log(`Owner ${socket.id} joined room org:${sess.org}`);
  }
  // Employees socket
  if (sess.role === 'crew' || sess.role === 'manager' && sess.loginid) {
    socket.join(`emp:${sess.loginid}`);
    console.log(`Employee ${socket.id} joined room emp:${sess.loginid}`);
  }
  socket.on('disconnect', () => {
  });
});


// start listening
server.listen(3000);