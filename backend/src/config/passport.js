import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Usuario } from '../validationSchemas.js';

const options = {
    secretOrKey: process.env.JWT_SECRET_KEY,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

passport.use(
    new JwtStrategy(options, async (payLoad, done) => {
        try {
            const user = await Usuario.findById(payLoad.id);

            if (!user) return done(null, false);
            return done(null, user);
        } catch (error) {
            done(error, false);
        }
    })
);

export default passport;