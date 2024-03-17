const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const Review = require('../models/reviewModel');
const factory = require('../controllers/handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);
    
    if (!reviews) {
        return next(new AppError('Can not find any review', 400));
    }

    res.status(200).json({
        status: 'success',
        result: reviews.length,
        review: {
            reviews
        }
    });
});

exports.createReview = catchAsync(async (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

        res.status(201).json({
            status: 'success',
            review: {
                newReview
            }
        });
});

exports.deleteReview = factory.deleteOne(Review);