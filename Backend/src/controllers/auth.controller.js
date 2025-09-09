const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    const { fullName: { firstName, lastName }, email, password } = req.body;

    const isUserExists = await userModel.findOne({ email });

    if (isUserExists) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    try {
        const newUser = new userModel({
            fullName: {
                firstName,
                lastName
            },
            email,
            password: hashedPassword
        });
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully',
            user: {
                id: newUser._id,
                fullName: {
                    firstName,
                    lastName
                },
                email: newUser.email
            },
            token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid user' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({ message: 'User logged in successfully',
            user: {
                id: user._id,
                fullName: {
                    firstName: user.fullName.firstName,
                    lastName: user.fullName.lastName
                },
                email: user.email
            },
            token });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

async function logoutUser(req, res) {
    try {
        // Clear the HTTP-only cookie
        res.clearCookie('token', { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};