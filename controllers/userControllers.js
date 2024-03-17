const User = require('../models/userModel');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        status: 'success',
        result: users.length,
        data: {
            users
        }
    })
});

exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) if create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for update password, please use /updateMyPassword', 400));
    };
    
    // 2) Update user document
    // can't use save, create because password and confirmpassword is required
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: 'Api is not defined'
    })
};

exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'fail',
        message: 'Api is not defined'
    })
};


exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);