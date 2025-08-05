// NovaNest/server/routes/api/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // We'll use this for Google routes too

// Load User Model
const User = require('../../models/User');

// --- @route   POST api/auth/register ---
// (Registration route code - no changes)
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            if (user.email === email) return res.status(400).json({ msg: 'User with this email already exists' });
            if (user.username === username) return res.status(400).json({ msg: 'Username is already taken' });
        }
        const newUser = new User({ username, email, password });
        await newUser.save();
        const userResponse = { _id: newUser._id, username: newUser.username, email: newUser.email, createdAt: newUser.createdAt };
        res.status(201).json({ msg: 'User registered successfully!', user: userResponse });
    } catch (err) {
        console.error("Registration error:", err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: 'Validation Error', errors: messages });
        }
        res.status(500).send('Server Error during registration');
    }
});

// --- @route   POST api/auth/login ---
// (Login route code - no changes)
router.post('/login', async (req, res) => {
    try {
        const { email, password: enteredPassword } = req.body;
        if (!email || !enteredPassword) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials (user not found)' });
        const isMatch = await user.comparePassword(enteredPassword);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials (password incorrect)' });
        const payload = { id: user.id, username: user.username, roles: user.roles };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '3h' }, (err, token) => {
            if (err) throw err;
            res.json({
                success: true, msg: 'Logged in successfully!', token: 'Bearer ' + token,
                user: { id: user.id, username: user.username, email: user.email, roles: user.roles }
            });
        });
        user.lastLoginAt = new Date();
        await user.save();
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).send('Server Error during login');
    }
});

// --- @route   GET api/auth/me ---
// (Protected route - no changes)
router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id, username: req.user.username, email: req.user.email,
        roles: req.user.roles, accessibleModules: req.user.accessibleModules,
        avatarUrl: req.user.avatarUrl, createdAt: req.user.createdAt
    });
});


// --- @route   GET api/auth/google ---
// --- @desc    Initiate Google OAuth authentication ---
// --- @access  Public ---
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'] // Scopes we want to request from Google
                                    // These should match the scopes configured in your Google Cloud Console
                                    // and what your passport strategy expects/uses.
    })
);

// --- @route   GET api/auth/google/callback ---
// --- @desc    Google OAuth callback URL ---
// --- @access  Public ---
router.get(
    '/google/callback',
    passport.authenticate('google', {
        // failureRedirect: '/login-failed', // A route to redirect to if Google auth fails (optional)
        session: false // We don't want to create a session here, we'll issue a JWT
    }),
    (req, res) => {
        // At this point, `req.user` should be populated by the GoogleStrategy's
        // verify callback (the user found or created in our DB).

        // We successfully authenticated with Google. Now, issue our own JWT.
        const payload = {
            id: req.user.id,
            username: req.user.username,
            roles: req.user.roles
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '3h' }, // Or your preferred expiration
            (err, token) => {
                if (err) {
                    console.error("Error signing JWT after Google auth:", err);
                    // Potentially redirect to an error page on the frontend
                    return res.status(500).json({ msg: 'Error issuing token' });
                }

                // Here, we need to send this token to the frontend.
                // For a web app, a common way is to redirect to a frontend route
                // and pass the token as a query parameter or store it in a way the frontend can access.
                // For testing now, we can just send it as JSON.
                // In a real app, you'd likely redirect to your frontend, e.g.:
                // res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
                res.json({
                    success: true,
                    msg: 'Google authentication successful!',
                    token: 'Bearer ' + token,
                    user: {
                        id: req.user.id,
                        username: req.user.username,
                        email: req.user.email,
                        roles: req.user.roles
                    }
                });
            }
        );
    }
);


module.exports = router;