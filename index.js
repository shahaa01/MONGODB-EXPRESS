const express = require('express');
const app = express();
const path = require('path');
const PORT = 8080;
const mongoose = require('mongoose');
const Task = require('./models/task');
const methodOverride = require('method-override');

//set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); //app.use expects a middleware function

//set required middlewares
app.use(express.urlencoded({extended: true})); //parses form "PUT" method data
app.use(express.json()); //parses JSON data
app.use(methodOverride('_method')); //for patch,put,delete functions

//formed connection to db
main().then(() => console.log("Database Connected Successfully")).catch(err => console.log(err));

//connection to database
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/tasks');
}

//routes for the app
//route to get all the tasks in the root page
app.get('/', async (req, res) => {
    let tasks = await Task.find();
    console.log(tasks);
    res.render('index', {tasks});
});

//route to show form to add new task
app.get('/newTask', (req, res) => {
    res.render('taskForm' , {
        errors: {},
        prevInput: {}
    });
})

//route to add a new task
app.post('/newTask', async (req, res) => {
    const {title, description, dueDate} = req.body;
    const parsedDueDate = new Date(dueDate);
    const parsedCreatedAt = new Date();
    const errors = {};

    //for mongoose to apply the default for title even if the title is an empty string
    if(!title || title.trim() === '') {
        req.body.title = undefined;
    }

    if(title?.length > 100) {
        errors.title = "Length exceeded - character limit is only 100 characters for title."
    }

    if(!description || description.trim() === '') {
        errors.description = "Description is required."
    }

    if(!dueDate || (Number.isNaN(parsedDueDate) || Number.isNaN(parsedCreatedAt)) || parsedDueDate <= parsedCreatedAt) {
        errors.dueDate = "Due date has to be a valid future date."
    }

    if(Object.keys(errors).length > 0) {
        return res.render('taskForm', {
            errors, 
            prevInput: req.body
        });
    }

    //no error in form validation - lets go
    try {
        const task = new Task(req.body);
        await task.save();
        res.redirect('/');
    } catch(err) {
        res.status(500).send(`The error is : ${err.message}`);
    }
});

//route to get the form to edit the post
app.get('/editTask/:id', async (req, res) => {
    res.render('editForm', {
        errors : {},
        prevInput: {},
        userTask: await Task.findById(req.params.id)
    });
});

//route to update the changes
// app.patch('/editTask', async (req, res) => {

// })

//server is listening at this port
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});


