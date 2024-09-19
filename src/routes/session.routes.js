import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../dao/model/users.models.js';
import { hashPassword } from '../utils/encrypt.js';
import passport from 'passport';

const router = express.Router();

const createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const hashedPassword = hashPassword(password);

        const newUser = new User({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            cart: null,
        });

        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
}

router.post('/register', createUser);

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ token });
});

router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
    res.json(req.user);
});

export default router;
