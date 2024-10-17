const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Save User (Register)
module.exports.saveUser = async (req, res) => {
    const { username, password } = req.body; // Ensure you have these fields in your request body
    if (username && password) {
        try {
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new UserModel({ username, password: hashedPassword });
            const savedUser = await newUser.save();
            console.log("Saved Successfully ", savedUser);
            res.status(201).send(savedUser);
        } catch (err) {
            console.log(err);
            res.send({ error: err, msg: "Something went wrong!" });
        }
    } else {
        res.status(400).send({ msg: "Username and password are required." });
    }
};

// Login User
module.exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await UserModel.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            // User exists and password matches
            const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1h' });
            return res.json({ token });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get Users
module.exports.getUsers = async (req, res) => {
    try {
        const users = await UserModel.find();
        res.send(users);
    } catch (err) {
        console.error(err);
        res.status(500).send({ msg: "Something went wrong!" });
    }
};

// Update User
module.exports.updateUser = (req, res) => {
    const { id } = req.params;
    const { User } = req.body;
    UserModel.findByIdAndUpdate(id, { User })
        .then(() => {
            res.send("Updated successfully");
        })
        .catch((err) => {
            console.log(err);
            res.send({ error: err, msg: "Something went wrong!" });
        });
};

// Delete User
module.exports.deleteUser = (req, res) => {
    const { id } = req.params;
    UserModel.findByIdAndDelete(id)
        .then(() => {
            res.send("Deleted successfully");
        })
        .catch((err) => {
            console.log(err);
            res.send({ error: err, msg: "Something went wrong!" });
        });
};
