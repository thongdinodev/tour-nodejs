const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appErrors');
const { promisify } = require('util');

//token signup and login diff

const generateToken = function (id) {

    // { id: newUser._id} correct syntax
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN
    })
}

exports.signup = catchAsync(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        role: req.body.role,
    });


    const token = generateToken(newUser._id);
    
    res.status(200).json({
        status: 'success',
        token,
        message: {
            data: newUser
        }
    })
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password} = req.body;

    // 1/ check exist email or password
    if (!email || !password) {
        return next(new AppError('Incorrect email or password', 400));
    }

    const userFound = await User.findOne({email}).select('+password');
    const correct = await userFound.correctPassword(password, userFound.password);
    console.log(userFound);
    // 2/ check correct password
    if (!correct) {
        return next(new AppError('Wrong password, please try again!', 401));
    }

    // 3/ if correctpassword send token to client
    const token = generateToken(userFound._id);
    if (userFound) {
        res.status(200).json({
            status: 'success',
            token
        })
    }
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) check is have headers authorization
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log(token);
    }

    if (!token) {
        return next(new AppError('You are not logged in, pls log in to get access', 401));
    }

    //2) Verification token
    // promisify: convert a callback fn to promise
    // verify is a promise fn
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded); //{id:..., iat:..., exp:...}

    // 3) check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist!', 401))
    }

   
    // 4)check if user changed password after the token was issued
    // modifi userSchema: add timestamp, add method changedPassword, to check password is changed?
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password! Please log in again!', 401));
    };

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();

});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action', 403)
            )
        }
        next();
    }
};

exports.forgotPassword = catchAsync( async (req, res, next) => {
    // 1) get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return next( new AppError('There is no user with email address'))
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

})

// invalid signature: wrong Bearer token, maybe in jwt.verify