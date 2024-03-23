const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');

let isHaveUser = false;
const checkUserLogin = (user) => {
    if (user === undefined) {
        return false;
    } else {
        return true;
    }
};

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();

    const userData = res.locals.user;
    isHaveUser = checkUserLogin(userData);


    res.status(200).render('overview', {
        title: 'All tours',
        tours,
        isHaveUser,
        user: userData
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'rating user photo'
    });

    if (!tour) {
        return next(new AppError('Can not find any tour with this name', 404));
    };

    const userData = res.locals.user;
    isHaveUser = checkUserLogin(userData);


    res.status(200).render('tour', {
        title: 'Detail Tour',
        tour,
        isHaveUser,
        user: userData
    });
});

exports.getLoginForm = (req, res, next) => {
    const userData = res.locals.user;
    isHaveUser = checkUserLogin(userData);


    res.status(200).render('login', {
        title: 'Login to your account',
        isHaveUser,
        user: userData
    });
};

exports.getAccount = (req, res, next) => {
    isHaveUser = checkUserLogin(req.user);

    res.status(200).render('account', {
        title: 'Your account',
        isHaveUser,
        user: req.user
    });
};