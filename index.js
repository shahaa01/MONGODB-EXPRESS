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
// Use both query string and hidden field
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // Look inside body
      return req.body._method;
    }
    if (req.query && '_method' in req.query) {
      // Look inside query string
      return req.query._method;
    }
  }));
  
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
    res.render('editForm' , {
        isEdit: false,
        errors: {},
        prevInput: {},
        userTask: {}
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
        return res.render('editForm', {
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
        userId : req.params.id,
        isEdit: true,
        errors : {},
        prevInput: {},
        userTask: await Task.findById(req.params.id)
    });
});

//route to update the changes
app.patch('/editTask/:id', async (req, res) => {
    let {title: newTitle, description: newDescription, dueDate: newDueDate} = req.body;
    const parsedDueDate = new Date(newDueDate);
    const parsedCreatedAt = new Date();
    const errors = {};

    //for mongoose to apply the default for title even if the title is an empty string
    if(!newTitle || newTitle.trim() === '') {
        newTitle = undefined;
    }

    if(newTitle?.length > 100) {
        errors.title = "Length exceeded - character limit is only 100 characters for title."
    }

    if(!newDescription || newDescription.trim() === '') {
        errors.description = "Description is required."
    }

    if(!newDueDate || Number.isNaN(parsedDueDate) || parsedDueDate <= parsedCreatedAt) {
        errors.dueDate = "Due date has to be a valid future date."
    }

    if(Object.keys(errors).length > 0) {
        return res.render('editForm', {
            errors, 
            prevInput: req.body,
            userId: req.params.id,
            userTask: await Task.findById(req.params.id)
        });
    }

    //no error in form validation - lets go
    try {
        await Task.findByIdAndUpdate(req.params.id, {
            title: newTitle,
            description: newDescription,
            dueDate: newDueDate
        });
        res.redirect('/')
    } catch(err) {
        res.status(500).send(`The error in patch is : ${err.message}`);
    }
})

//server is listening at this port
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});


