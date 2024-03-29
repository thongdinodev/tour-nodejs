const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appErrors');
const sendEmail = require('../utils/email');
const { promisify } = require('util');

//token signup and login diff

const signToken = function (id) {
    // { id: newUser._id} correct syntax
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_IN
    })
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expiresIn: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
    };
    // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    // remove password from show
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
};

exports.signup = catchAsync(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });

    createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password} = req.body;

    // 1/ check exist email or password
    if (!email || !password) {
        console.log('login error');
        return next(new AppError('Incorrect email or password in login', 400));
    }

    const user = await User.findOne({email}).select('+password');
    const correct = await user.correctPassword(password, user.password);
    
    // 2/ check correct password
    if (!correct) {
        return next(new AppError('Wrong password, please try again!', 401));
    }

    // 3/ if correctpassword send token to client
    createSendToken(user, 200, req, res);

});

exports.logout = (req, res, next) => {
    res.clearCookie('jwt');
    res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
    // 1) check is have headers authorization
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];        
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
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
    // assign res.locals.user to use render info current user is logging in 
    res.locals.user = currentUser;
    next();

});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
    
    if (req.cookies.jwt) {
        try {
            
            //1) Verification token
            // promisify: convert a callback fn to promise
            // verify is a promise fn
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
            //console.log(decoded); //{id:..., iat:..., exp:...}

            // 2) check if user still exists
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

        
            // 3)check if user changed password after the token was issued
            // modifi userSchema: add timestamp, add method changedPassword, to check password is changed?
            if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next();
            };
            
            // GRANT ACCESS TO PROTECTED ROUTE
            req.user = currentUser;
            // assign res.locals.user to use render info current user is logging in 
            res.locals.user = currentUser;
            return next();
        } catch (error) {
            return next();
        }
    }
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
        return next( new AppError('There is no user with email address', 404))
    }

    // 2) Generate the random reset token
    const resetToken1 = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken1}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n If you didn't forget password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token in 5 min',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

});

exports.resetPassword = catchAsync(async(req, res, next) => {
    // 1) Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() } 
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired!', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get posted user
    const user = await User.findById(req.user.id).select('+password');
    console.log(user);
    if (!user) {
        return next(new AppError(`Can't find the user with email address`, 404))
    }

    // 2) check password is correct
    const correct = await user.correctPassword(req.body.passwordCurrent, user.password);
    if (!correct) {
        return next(new AppError(`Wrong password current, please try again!`, 401))
    }

    // 3) if so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) send JWT
    createSendToken(user, 200, req, res);
});


// invalid signature: wrong Bearer token, maybe in jwt.verify