// NovaNest/server/config/passportConfig.js

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");

// Middleware for protecting routes
const authenticateToken = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return res.status(500).json({ message: "Auth error", error: err });
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = function (passportInstance) {
  // --- JWT Strategy ---
  const jwtOpts = {};
  jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  jwtOpts.secretOrKey = process.env.JWT_SECRET;

  passportInstance.use(
    new JwtStrategy(jwtOpts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id).select("-password");
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

  // --- Google OAuth Strategy ---
  passportInstance.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.avatarUrl = profile.photos[0]?.value || user.avatarUrl;
            user.lastLoginAt = new Date();
            await user.save();
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            user.avatarUrl = profile.photos[0]?.value || user.avatarUrl;
            user.lastLoginAt = new Date();
            if (profile.emails[0].verified && user.status === "pending_verification") {
              user.status = "active";
            }
            await user.save();
            return done(null, user);
          }

          let newUsername = profile.displayName || profile.emails[0].value.split("@")[0];
          while (await User.findOne({ username: newUsername })) {
            newUsername += Math.floor(Math.random() * 1000);
          }

          const newUser = new User({
            googleId: profile.id,
            username: newUsername,
            email: profile.emails[0].value,
            avatarUrl: profile.photos[0]?.value || null,
            status: profile.emails[0].verified ? "active" : "pending_verification",
          });

          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          console.error("Error in Google OAuth Strategy:", err);
          return done(err, false);
        }
      }
    )
  );

  passportInstance.serializeUser((user, done) => {
    done(null, user.id);
  });

  passportInstance.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

// ✅ Export authenticateToken so routes can use it
module.exports.authenticateToken = authenticateToken;
