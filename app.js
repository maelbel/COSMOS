if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config()
}

const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const i18n = require('i18n');

const userRoutes = require('./routes/user');

// Set up mongoose connection
mongoose.connect('mongodb+srv://mael:kpdlKfOmJ5JmS1yf@cluster0.jecvo.mongodb.net/cosmos?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));


  i18n.configure({
    // setup some locales - other locales default to en silently
    locales: ['fr', 'en', 'co'],
  
    // you may alter a site wide default locale
    defaultLocale: 'fr',
  
    // sets a custom cookie name to parse locale settings from - defaults to NULL
    cookie: 'lang',
  
    // sets a custom header name to read the language preference from - accept-language header by default
    header: 'accept-language',
  
    // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
    queryParameter: 'lang',
  
    // where to store json files - defaults to './locales' relative to modules directory
    directory: path.join(__dirname, '/locales'),

    objectNotation: true,
  
    // set the language catalog statically
    // also overrides locales
    staticCatalog: {
      fr: require(path.join(__dirname, '/locales/fr/translation.json')),
      en: require(path.join(__dirname, '/locales/en/translation.json')),
      co: require(path.join(__dirname, '/locales/co/translation.json'))
    }
  })
// initialized and ready to go!

const app = express();

//Middlewares
app.use(express.static('assets'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser('secret'));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: null }
}));

//flash message middleware
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  res.locals.userName = req.session.userName;
  res.locals.url = req.session.url;
  delete req.session.message;
  next();
});

//Handlebars
app.set('views', path.join( __dirname, 'views'));
app.engine('handlebars', handlebars({
  defaultLayout: 'index',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: 'handlebars',
  helpers: {
     __: function() {
         return i18n.__.apply(this, arguments);
     },
     __n: function() {
         return i18n.__n.apply(this, arguments);
     }
  }
}));
app.set('view engine', 'handlebars');

app.use(i18n.init);

//route for home page
app.get('/', (req, res) => {
  res.locals.url = "/";
  res.render('main');
});

app.get('/solar_system', (req, res) => {
  res.locals.url = "/solar_system";
  res.render('solar_system')
});

app.get('/login', (req, res) => {
  res.locals.url = "/login";
  res.render('login')
});

app.get('/register', (req, res) => {
  res.locals.url = "/register";
  res.render('register')
});

// Logout endpoint
app.get('/logout', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

app.use('/', userRoutes);

module.exports = app;