const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();


    res.status(200).render('overview', {
        title: 'All tour Page',
        tour: 'This is all tour page NODEJS Project',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'rating user photo'
    });

    if (!tour) {
        return next(new AppError('Can not find any tour with this slug name', 400));
    };

    res.status(200).render('tour', {
        title: 'Detail Tour page',
        tour
    });
});