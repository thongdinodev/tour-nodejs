const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name!'],
        trim: true, 
        lowercase: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        validate: [validator.isEmail, 'please provide valid email!']
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please provide your password!'],
        minlength: 8,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please provide your name!'],
        validate: {
            validator: function(el) {
                return el === this.password
            },
            message: 'Password are not the same'
        }
    },
    passwordChangedAt: {
        type: Date
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    // hash password
    this.password = await bcrypt.hash(this.password, 12);
    // hash: used for asynchonously, return a promise
    // hashSync: used for synchonously

    // delete confirmpassword fields because it has not hash
    this.confirmPassword = undefined;
    next();
});

// function to compare password user type vs user's password account
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp;
    }
    
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;