/* load express module. */
var express = require('express');
/* initialize express module/app. */
var app = express();

/* load path module. */
var path = require('path');

/* set path for "views" directory in the codebase */
app.set("views", path.join(__dirname, "views"));
/* set 'hogan-express' as templeting engine for HTML rendering */
app.engine("html", require('hogan-express'));
app.set('view engine', 'html');

/* set path to static content like images,css etc */
app.use(express.static(path.join(__dirname, "public")));

/* load user defined config module to get configuration based on environment
set using process.env.NODE_ENV from developer.json or production.json files */
var config = require('./config/config');

/* load cookie-parser & express-session middlewares for managing session
- Default session management is good enough for development env */
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var session = require('express-session');

/* Where as in production, it might lead to memory leak.
 So it is advisible to use db store such as mongodb/redis for session management in producton env.
 - connect-mongo is the middleware that connects to mongodb for storing sessions */
var ConnectMongo = require('connect-mongo')(session);

/* Mongood is object modeling API for mongodb.
To save data to mongodb using simple javascript objects*/
var mongoose = require('mongoose');
mongoose.connect(config.dbURL);

/* check if the env is development or prodcution.
if development:
- use default session store provided by express-session
if production:
- use 'connect-mongo' middleware to connect & store session data into mongodb.
- - Option 1: Just opens new connection by connecting to url.
- Option 2: make use of 'mongoose' middleware connection pool.
    - Stringify:true will convert objects to string and store into db.
*/
var env = process.env.NODE_ENV || 'development';

if (env === 'development') {
    app.use(session({
        secret: config.secretSalt,
        saveUninitialized: true,
        resave: true
    }));
} else {
    app.use(session({
        secret: config.secretSalt,
        store: new ConnectMongo({
            /*url: config.dbURL,*/ // Option 1
            mongoose_connection: mongoose.connections[0], // Option 2
            stringify: true

        })
    }))

}

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

app.use(passport.initialize());
app.use(passport.session());

var auth = require('./auth/passportAuth')(passport, FacebookStrategy, config, mongoose);

/* load user defined routing logic. refer ./route/route.js file*/
require('./routes/routes.js')(express, app, passport, config);

/* Application listens to port mentioned */
/*app.listen(3000, function() {
    console.log('ChatCAT working on port 3000');
    console.log('Mode :', env);
});*/

app.set('port', process.env.port || 3000);
var server = require('http');

server = server.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Server listening at port: ', app.get('port'));
});

var io = require('socket.io').listen(server);

var rooms = [];
var socket = require('./socket/socket')(io, rooms);