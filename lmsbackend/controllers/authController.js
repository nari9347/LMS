const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
    const { name, email, password, role, accessCode } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedRole = role === 'teacher' ? 'teacher' : 'student';
    const normalizedAccessCode = (accessCode || '').trim();

    if (!name || !normalizedEmail || !password) {
        return res.status(400).json({ msg: 'Please provide name, email, and password' });
    }

    const requiredCode = normalizedRole === 'teacher' ? 'baby143' : 'niha143';
    if (normalizedAccessCode !== requiredCode) {
        return res.status(400).json({ msg: 'Invalid registration code for selected role' });
    }

    try {
        let user = await User.findOne({ email: normalizedEmail });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({ name: name.trim(), email: normalizedEmail, password, role: normalizedRole });
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });

        return res.json({ token });
    } catch (err) {
        console.error('Register error:', err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        return res.status(500).json({ msg: 'Registration failed. Please try again.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
        return res.status(400).json({ msg: 'Please provide email and password' });
    }

    try {
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        });

        return res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ msg: 'Login failed. Please try again.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
