const mongoose = require('mongoose');

let attachmentsSchema = new mongoose.Schema({
  originalName: {type: String, required: true},
  path: {type: String, required: true},
  date: {type: Date, "default": Date.now}
});

let taskSchema = new mongoose.Schema({
  taskName: {type: String, required: true},
  description: {type: String, 'default': ''},
  date: {type: Date, 'default': null},
  status: {type: Boolean, 'default': false},
  attachments: [attachmentsSchema]
});

let listSchema = new mongoose.Schema({
  listName: {type: String, required: true},
  tasks: [taskSchema]
});

let boardSchema = new mongoose.Schema({
  lists: [listSchema],
  color: {type: String, "default": "#0079BF"}
});

mongoose.model('Board', boardSchema);