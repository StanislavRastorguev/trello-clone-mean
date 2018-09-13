const mongoose = require('mongoose');
const Board = mongoose.model('Board');
const fs = require('fs-extra');

//json response and status code to client side
let sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

//create task in list
module.exports.createTask = (req, res) => {

  const { boardid, listid} = req.params;
  let taskName = req.body.taskName;

  //check task information
  if (!taskName) {
    sendJsonResponse(res, 400, {
      "message": "Task name format: {'taskName': 'name'}"
    });
    return;
  }
  if (!boardid || !listid) {
    sendJsonResponse(res, 400, {
      "message": "BoardID and listID are both required"
    });
    return;
  }

  //find board by id
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {
      if (!board) {
        sendJsonResponse(res, 404, {
          "message": "Board is not found"
        })
      } else if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        addTask(req, res, board);
      }
    });

};

//function for add task in list
let addTask = (req, res, board) => {

  //check task information
  let listid = req.params.listid;
  if (!listid) {
    sendJsonResponse(res, 400, {
      "message": "Listid is required"
    });
    return;
  }

  //find list by id
  let list = board.lists.id(listid);
  if (!list) {
    sendJsonResponse(res, 404, {
      "message": "List not found"
    });
  } else {

    //add task on the top or bottom
    if (req.body.side === 'top' ) {
      list.tasks.unshift({
        taskName: req.body.taskName
      });
    } else {
      list.tasks.push({
        taskName: req.body.taskName
      });
    }
    board.save((err, data) => {
      if (err) {
        sendJsonResponse(res, 404, err);
      } else {
        let { tasks } = data.lists.id(listid);
        let task;
        if (req.body.side === 'top' ) {
          task = tasks[0];
        } else {
          task = tasks[tasks.length-1];
        }
        sendJsonResponse(res, 201, task);
      }
    })
  }

};

//update task
module.exports.updateTask = (req, res) => {

  const { taskName: newTaskName, description: newTaskDescription, date: newTaskDate, status: newTaskStatus } = req.body;
  const { boardid, listid, taskid} = req.params;

  //check task information
  if (!boardid || !listid || !taskid) {
    sendJsonResponse(res, 400, {
      "message": "BoardID, listID and taskID are all required"
    });
    return;
  }
  if (!newTaskDate && newTaskDate !== null) {
    sendJsonResponse(res, 400, {
      "message": "Wrong task date format"
    });
    return;
  }
  if (newTaskStatus !== true && newTaskStatus !== false) {
    sendJsonResponse(res, 400, {
      "message": "Wrong task status format"
    });
    return;
  }

  //find board by id
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {

      //check board
      if (!board) {
        sendJsonResponse(res, 404, {
          "message": "Board is not found"
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      //find list by id
      let list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          "message": "List is not found"
        });
        return;
      }

      //find task by id if it exists
      if (list.tasks && list.tasks.length > 0) {
        let task = list.tasks.id(taskid);
        if (!task) {
          sendJsonResponse(res, 404, {
            "message": "Task is not found"
          });
        } else {

          //update task information and save board
          newTaskName ? task.taskName = newTaskName : task.taskName;
          newTaskDescription ? task.description = newTaskDescription : task.description = '';
          newTaskDate === null ? task.date = null : task.date = newTaskDate;
          newTaskStatus === true ? task.status = true : task.status = false;
          board.save((err, board) => {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              let newList = board.lists.id(listid);
              let newTask = newList.tasks.id(taskid);
              sendJsonResponse(res, 200, newTask);
            }
          })
        }
      } else {
        sendJsonResponse(res, 404, {
          "message": "Tasks is not found"
        });
      }
    })

};

//delete task
module.exports.deleteTask = (req, res) => {

  const { boardid, listid, taskid} = req.params;

  //check task information
  if (!boardid || !listid || !taskid) {
    sendJsonResponse(res, 400, {
      "message": "BoardID, listID and taskID are all required"
    });
    return;
  }

  //find board by id
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {

    //check board
      if (!board) {
        sendJsonResponse(res, 404, {
          "message": "Board is not found"
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }

      //find list by id
      let list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          "message": "List is not found"
        });
        return;
      }

      //find task by id if it exists
      if (list.tasks && list.tasks.length > 0) {
        let task = list.tasks.id(taskid);
        if (!task) {
          sendJsonResponse(res, 404, {
            "message": "Task is not found"
          });
        } else {

          //remove task from db and folders with attachments
          let taskDirectoryPath = `app_client/lib/images/board_${boardid}/${list.listName}_${listid}/${task.taskName}_${taskid}`;
          task.remove();
          fs.removeSync(taskDirectoryPath);
          board.save((err) => {
            if (err) {
              sendJsonResponse(res, 404, err);
            } else {
              sendJsonResponse(res, 204, null);
            }
          })
        }
      } else {
        sendJsonResponse(res, 404, {
          "message": "Tasks is not found"
        });
      }
    });

};
