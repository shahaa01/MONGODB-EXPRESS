const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {type: String, default: "No Title Given", maxlength: 100},
        description: {type: String, required: true},
        createdAt: {type: Date, default:Date.now},
        dueDate: {type: Date, required: true}
    }
);


//we need to export this inorder to let other file require it
module.exports = mongoose.model("Task", taskSchema);;