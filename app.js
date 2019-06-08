const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

//Configure mongoose's promise to global promise
mongoose.promise = global.Promise;

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'deepapi', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));
app.set('view engine', 'ejs');
if(!isProduction) {
    app.use(errorHandler());
}

//Configure Mongoose
mongoose.connect('mongodb://localhost/deepapi');
mongoose.set('debug', true);

//Models & routes
require('./models/Users');
require('./models/Platforms');
require('./models/Customers');
require('./models/Orders');
require('./models/Transactions');
require('./config/passport');
app.use(require('./routes'));

app.get('/about', function(req, res) {
    res.render('pages/about');
});
app.use('/cors', function (req, res) {
    res.status(500).json({status: false, msg: 'No route found'});
});
app.use('/*', function (req, res) {
    res.status(500).json({status: false, msg: 'No route found live server'});
});
app.listen(8000, () => console.log('Server running on http://localhost:8000/'));