const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

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
    role: {
        type: String,
        enum: ['user', 'lead-guide', 'admin', 'guide'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide your password!'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
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
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    // hash password
    this.password = await bcrypt.hash(this.password, 12);
    // hash: used for asynchonously, return a promise
    // hashSync: used for synchonously

    // delete passwordConfirm fields because it has not hash
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre(/^find/, async function(next) {
    this.find({ active: { $ne: false } });
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

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    console.log({resetToken}, this.passwordResetToken);
    // log reset token when user forgot password

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;