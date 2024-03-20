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

exports.getTour = (req, res, next) => {
    res.status(200).render('tour', {
        title: 'Detail tour',
        tour: 'This is a detail tour page'
    });
};