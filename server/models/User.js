// NovaNest/server/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: function() { return !this.googleId; },
        minlength: [6, 'Password must be at least 6 characters long']
        // We might add select: false later so it's not returned by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatarUrl: {
        type: String,
        trim: true,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'suspended', 'pending_verification'],
        default: 'pending_verification'
    },
    roles: {
        type: [{
            type: String,
            enum: ['user', 'admin']
        }],
        default: ['user']
    },
    accessibleModules: {
        type: [{
            type: String,
            enum: ['ThinkTrek', 'BugTrace', 'Achievify']
        }],
        default: ['ThinkTrek', 'BugTrace', 'Achievify']
    },
    lastLoginAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
    // 'this' refers to the current user document
    if (!this.isModified('password')) {
        return next(); // If password hasn't been changed, skip hashing
    }

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed to save
    } catch (error) {
        next(error); // Pass error to the next middleware
    }
});

// Method to compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema
const User = mongoose.model('User', userSchema);

module.exports = User;