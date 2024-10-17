const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/UserRoute');
require('dotenv/config');
const Users = require('./models/UserModel');
const serverless = require('serverless-http');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await Users.findOne({ username });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Send the token to the client
    res.json({ token });
});

// DB Connect
const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(process.env.DB_URI, dbOptions)
    .then(() => console.log('Mongo Database Successfully Connected'))
    .catch(err => console.log(err));

// Dashboard Route
app.get('/dashboard', authenticateToken, (req, res) => {
    res.json({ message: 'Welcome to your dashboard!', user: req.user });
});

module.exports = serverless(app);
