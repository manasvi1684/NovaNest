// NovaNest/server/config/passportConfig.js

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth20').Strategy; // <-- 1. Import Google Strategy
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function(passport) {
    // --- JWT Strategy (existing) ---
    const jwtOpts = {};
    jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    jwtOpts.secretOrKey = process.env.JWT_SECRET;

    passport.use(
        new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
            // console.log('JWT Strategy - Decoded Payload:', jwt_payload);
            try {
                const user = await User.findById(jwt_payload.id).select('-password');
                // console.log('JWT Strategy - User found in DB:', user ? user.username : 'No user found');
                if (user) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch (err) {
                console.error("Error during JWT authentication strategy:", err);
                return done(err, false);
            }
        })
    );

    // --- Google OAuth 2.0 Strategy ---
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,         // <-- 2. Use from .env
                clientSecret: process.env.GOOGLE_CLIENT_SECRET, // <-- 2. Use from .env
                callbackURL: process.env.GOOGLE_CALLBACK_URL,   // <-- 2. Use from .env
                // passReqToCallback: true // Optional: if you need access to req object in callback
            },
            // This is the "verify callback" function that runs after Google authenticates the user
            // and sends back their profile information.
            // accessToken: the token Google gives us to make API calls on behalf of the user (we might not use it directly for now)
            // refreshToken: a token to get a new accessToken if the current one expires (usually not needed if we issue our own JWT immediately)
            // profile: the user's Google profile information (name, email, photos, etc.)
            // done: the Passport callback to signal success or failure
            async (accessToken, refreshToken, profile, done) => {
                // --- 3. Logic to find or create a user in our DB ---
                // console.log("Google Profile Received:", profile); // Useful for seeing what Google sends

                const googleUser = {
                    googleId: profile.id, // This is the unique Google ID for the user
                    username: profile.displayName || profile.emails[0].value.split('@')[0], // Use display name or derive from email
                    email: profile.emails[0].value, // Google usually provides at least one verified email
                    avatarUrl: profile.photos[0] ? profile.photos[0].value : null, // Get first photo if available
                    // We don't get a password from Google.
                    // The 'password' field in our User schema is conditionally required.
                    // Users logging in via Google won't have a NovaNest-specific password set directly.
                };

                try {
                    // Check if this Google user already exists in our database
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        // User already exists, log them in
                        // We could update their avatarUrl or name if it changed in Google
                        user.avatarUrl = googleUser.avatarUrl || user.avatarUrl; // Update if new one exists
                        user.lastLoginAt = new Date();
                        await user.save();
                        return done(null, user); // Pass the existing user to Passport
                    } else {
                        // New user via Google
                        // Check if a user with this email already exists (e.g., they signed up with email/password before)
                        user = await User.findOne({ email: googleUser.email });
                        if (user) {
                            // User with this email exists. Link Google ID to this account.
                            // This is a common scenario: user signed up with email, now uses Google Sign-In.
                            user.googleId = googleUser.googleId;
                            user.avatarUrl = googleUser.avatarUrl || user.avatarUrl;
                            user.lastLoginAt = new Date();
                            // If their status was 'pending_verification' from an email signup,
                            // and Google email is verified, we can mark them 'active'.
                            if (profile.emails[0].verified && user.status === 'pending_verification') {
                                user.status = 'active';
                            }
                            await user.save();
                            return done(null, user);
                        } else {
                            // Truly a new user. Create them in our database.
                            // Ensure username is unique if derived. If displayName isn't unique,
                            // you might need to append random chars or let user set it later.
                            // For simplicity, we'll try with displayName or derived email part.
                            // More robust username generation might be needed for production.
                            let newUsername = googleUser.username;
                            let existingUsernameUser = await User.findOne({ username: newUsername });
                            let attempt = 0;
                            while(existingUsernameUser) { // Handle potential username collision
                                attempt++;
                                newUsername = `${googleUser.username}${attempt}`;
                                existingUsernameUser = await User.findOne({ username: newUsername });
                            }

                            const newUser = new User({
                                googleId: googleUser.googleId,
                                username: newUsername,
                                email: googleUser.email,
                                avatarUrl: googleUser.avatarUrl,
                                status: profile.emails[0].verified ? 'active' : 'pending_verification', // If Google email is verified
                                // Password will be undefined, which is fine due to schema conditional requirement
                            });
                            await newUser.save();
                            return done(null, newUser); // Pass the new user to Passport
                        }
                    }
                } catch (err) {
                    console.error("Error in Google OAuth Strategy:", err);
                    return done(err, false);
                }
            }
        )
    );

    // --- Passport session serialization/deserialization (Potentially needed for OAuth flow) ---
    // When using OAuth, Passport typically uses sessions to remember the user between the
    // redirect to Google and the callback from Google.
    // After Google auth, we'll issue our own JWT, making sessions less critical for subsequent API calls,
    // but they are often part of the initial OAuth dance.

    passport.serializeUser((user, done) => {
        // console.log("Serializing user:", user.id);
        done(null, user.id); // Store user.id in the session
    });

    passport.deserializeUser(async (id, done) => {
        // console.log("Deserializing user by ID:", id);
        try {
            const user = await User.findById(id);
            done(null, user); // Make user object available as req.user
        } catch (err) {
            done(err, null);
        }
    });
};