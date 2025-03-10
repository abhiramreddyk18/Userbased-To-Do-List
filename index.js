const connectDB = require('./mongoose');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbstore = require("connect-mongodb-session")(session);
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './view');

connectDB();

const store = new mongodbstore({
    uri: "mongodb://localhost:27017/TODO_list",
    collection: "userSession"
});

app.use(session({
    secret: 'this is secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));

const Schema1 = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Schema2 = new mongoose.Schema({
    userId: String,
    task: String,
    completed: Boolean
});

const User = mongoose.model('User', Schema1);
const Task = mongoose.model('Task', Schema2);

// Home route
app.get('/', (req, res) => {
    res.render('profile');
});

// Register page
app.get('/register', (req, res) => {
    res.render('register');
});

// Register user
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const check = await User.findOne({ email: email });

        if (check !== null) {
            return res.render('register', { error: "Email already exists" });
        }

        const newUser = new User({ name, email, password });
        await newUser.save();

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('register', { error: "Registration failed. Try again!" });
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.render('profile', { error: "Email does not exist" });
        }

        if (password === user.password) {
            req.session.userId = user._id;
            return res.redirect('/welcome');
        } else {
            return res.render('profile', { error: "Incorrect password" });
        }
    } catch (err) {
        console.error(err);
        res.render('profile', { error: "Something went wrong. Try again." });
    }
});

// Welcome Page - Display only logged-in user's tasks
app.get('/welcome', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        const tasks = await Task.find({ userId: req.session.userId });
        res.render('welcome', { tasks });
    } catch (err) {
        console.error(err);
        res.render('welcome', { tasks: [], error: "Something went wrong" });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Add Task - Only for logged-in user
app.post('/addtask', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        const task = new Task({ userId: req.session.userId, task: req.body.task, completed: false });
        await task.save();
    } catch (err) {
        console.error(err);
    }

    res.redirect('/welcome');
});

// Remove Task - Only for logged-in user
app.post('/removetask', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    try {
        await Task.deleteOne({ _id: req.body.taskId, userId: req.session.userId });
    } catch (err) {
        console.error(err);
    }

    res.redirect('/welcome');
});

// Start Server
app.listen(8000, () => {
    console.log("Server running on port 8000");
});
