const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const path = require('path');
const cookieParser = require('cookie-parser');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');


dotenv.config({ path: './config.env' });

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// serving static file
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(`${__dirname}/public`));



app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
app.use(express.json());
// app.use(morgan('dev'));


// limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour' 
});
app.use('/', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(req.cookies);
    next();
});

// data sanitization against NoSQL query injection, reject: {$gte}
app.use(mongoSanitize());

// data sanitazation, convert special char to normal char
app.use(xss());

// protect from pollute query
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

// USE ROUTES

app.use('/api/tours', tourRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/', viewRouter);

module.exports = app;