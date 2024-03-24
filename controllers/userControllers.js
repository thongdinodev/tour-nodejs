const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/handlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'public/img/users/');
//     },
//     filename: function (req, file, cb) {
//         const ext = `${file.mimetype.split('/')[1]}`;
//         cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not image! Please only upload image file.', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};

    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el]
    });
    return newObj;
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
};

exports.uploadUserPhoto = upload.single('photo');


exports.updateMe = catchAsync(async (req, res, next) => {
    // 1) if create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for update password, please use /updateMyPassword', 400));
    };
    
    // 2) Update user document
    // can't use save, create because password and confirmpassword is required
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) {
        req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

        if (req.file.filename) filteredBody.photo = req.file.filename; // update photo field(model)
        // filteredBody = {name, email, photo: ...};
        await sharp(req.file.buffer)
                .resize(500, 500)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/users/${req.file.filename}`, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('image resized');
                    }
            });
    }

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

