const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userRoutes = require('./routes/UserRoute');
require('dotenv/config');
const Users = require('./models/UserModel');

try {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    const corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200,
        credentials: true
    };
    app.use(cors(corsOptions));
    app.use("/login", userRoutes);
    // Login Endpoint
    app.post('/login', async (req, res) => {
        const { username, password } = req.body;

        // Find the user in the database
        const user = await Users.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
            console.log(res)
        }

        // Compare passwords
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
            console.log(res)
        }
    })

    //     // Generate JWT token
    //     const token = jwt.sign(
    //         { userId: user._id, username: user.username },
    //         process.env.JWT_SECRET,
    //         { expiresIn: '1h' }
    //     );

    //     // Send the token to the client
    //     res.json({ token });
    // });

    // // Middleware to authenticate JWT
    // const authenticateToken = (req, res, next) => {
    //     const authHeader = req.headers['authorization'];
    //     const token = authHeader && authHeader.split(' ')[1];  // Bearer TOKEN

    //     if (!token) {
    //         return res.status(401).json({ error: 'Access denied. No token provided.' });
    //     }

    //     // Verify the token
    //     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //         if (err) {
    //             return res.status(403).json({ error: 'Invalid token.' });
    //         }

    //         // Add user 
    //         req.user = user;
    //         next();
    //     });
    // };

    // DB Connect 
    const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true }
    mongoose.connect(process.env.DB_URI, dbOptions)
        .then(() => console.log('Mongo Database Successfully Connected'))
        .catch(err => console.log(err));

    const port = process.env.PORT;



    app.get('/dashboard', authenticateToken, (req, res) => {
        res.json({ message: 'Welcome to your dashboard!', user: req.user });
    });


    const server = app.listen(port, () => {
        console.log("Server is running on : ", port);
    })
} catch (error) {
    console.log(error)
}
