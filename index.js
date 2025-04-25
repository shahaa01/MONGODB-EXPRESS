const express = require('express');
const app = express();
const path = require('path');
const PORT = 8080;
const mongoose = require('mongoose');
const Task = require('./models/task');

//set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public"))); //app.use expects a middleware function

//set required middlewares
app.use(express.urlencoded({extended: true})); //parses form "PUT" method data
app.use(express.json()); //parses JSON data

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
})

//server is listening at this port
app.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});


