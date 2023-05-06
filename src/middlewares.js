import passport from "passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "./modules/users/model.js";
import { config } from "./config.js";

const strategyOpts = {
  secretOrKey: config.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new Strategy(strategyOpts, (payload, done) => {
    User.findOne({ _id: payload._id })
      .then((user) => {
        if (!user) return done(new Error("User not existing"));
        return done(null, user);
      })
      .catch(done);
  })
);

export const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (error, user) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!user || error || token !== user.token)
      return res.status(401).json({ message: "Not authorized" });
    req.user = user;
    next();
  })(req, res, next);
};
