const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');
const Review = require('../models/reviewModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find().populate('tour user');
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