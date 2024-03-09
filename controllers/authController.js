const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appErrors');

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
})