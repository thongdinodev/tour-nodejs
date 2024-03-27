require('dotenv').config();
const stripe = require('stripe')("sk_test_51Oyx4oH3yLB7VM2cWXFiQPUcg1XPyXuYy3uNQY62JFxlPy9ybZOLmwe0bjKAYQ45Fa3qiV0BoKiJ7dOkK3rrmCVq001H5uk0H2");

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        line_items: [
            {
              price_data: {
                currency: 'usd',
                unit_amount: tour.price * 100,
                product_data: {
                  name: `${tour.name} Tour`,
                  description: tour.summary,
                  images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                },
              },
              quantity: 1,
            },
          ],
          mode: 'payment',

    });

    // 3) Create session as response
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    const {tour, user, price} = req.query;

    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price});

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.createOne(Booking);