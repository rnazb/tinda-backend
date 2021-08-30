if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const ExpressError = require('./utils/ExpressError');

const User = require('./models/user');

const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Keys and env setup

const port = process.env.PORT || 4000;
const dbUrl = process.env.NODE_ENV === 'production' ?
  process.env.DB_URL : 'mongodb://localhost:27017/tindo';

const secret = process.env.SECRET;

// Database configuration

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'DATABASE CONNECTION ERROR:'));
db.once('open', () => {
  console.log('DATABASE CONNECTED');
});

const app = express();

// Parse and configure requests

const clientOrigin = process.env.NODE_ENV === 'production' ?
  process.env.CLIENT_DOMAIN : 'http://localhost:3000';

const corsConfig = {
  origin: clientOrigin,
  methods: ['OPTIONS', 'GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  credentials: true,
  preflightContinue: true,
  maxAge: 3000
};

app.options('*', cors(corsConfig));
app.use(cors(corsConfig));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session and store configuration

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on('error', (err) => {
  console.log('SESSION STORE ERROR', err)
});

app.set("trust proxy", 1);

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 1, // in miliseconds * seconds * minutes * hours * days
    maxAge: 1000 * 60 * 60 * 24 * 1,
    secure: process.env.NODE_ENV === "production"
  }
};

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//

// Routing

app.use('/api/products', productRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Welcome to the home page!' });
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Resource Not Found!', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong!' } = err;
  if (!err.message) {
    err.message = 'Oh no! Something went wrong!'
  }
  res.status(statusCode).send(err);
});

app.listen(port, () => {
  console.log(`SERVING ON PORT ${port}`);
});