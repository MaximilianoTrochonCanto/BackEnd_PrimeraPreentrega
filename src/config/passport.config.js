import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

// Configuración de la estrategia JWT
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret' // Usa una clave secreta fuerte
};

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        // Buscar el usuario por ID en el payload del JWT
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

// Extractor personalizado para la estrategia "current" (extraer desde una cookie)
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt']; // Nombre de la cookie donde se almacena el JWT
    }
    return token;
};

// Configuración de la estrategia "current" usando un extractor de cookies
const optsCookie = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: 'your_jwt_secret'
};

passport.use('current', new JwtStrategy(optsCookie, async (jwt_payload, done) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

export default passport;
