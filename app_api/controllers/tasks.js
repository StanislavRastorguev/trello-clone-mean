const mongoose = require('mongoose');

const Board = mongoose.model('Board');
const fs = require('fs-extra');

// json response and status code to client side
const sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

// function for add task in list
const addTask = (req, res, board) => {
  // check task information
  const { listid } = req.params;
  if (!listid) {
    sendJsonResponse(res, 400, {
      message: 'Listid is required',
    });
    return;
  }

  // find list by id
  const list = board.lists.id(listid);
  if (!list) {
    sendJsonResponse(res, 404, {
      message: 'List not found',
    });
  } else {
    // add task on the top or bottom
    if (req.body.side === 'top') {
      list.tasks.unshift({
        taskName: req.body.taskName,
      });
    } else {
      list.tasks.push({
        taskName: req.body.taskName,
      });
    }
    board.save((err, data) => {
      if (err) {
        sendJsonResponse(res, 404, err);
      } else {
        const { tasks } = data.lists.id(listid);
        let task;
        if (req.body.side === 'top') {
          // eslint-disable-next-line prefer-destructuring
          [task] = tasks;
        } else {
          task = tasks[tasks.length - 1];
        }
        sendJsonResponse(res, 201, task);
      }
    });
  }
};

// create task in list
module.exports.createTask = (req, res) => {
  const { boardid, listid } = req.params;
  const { taskName } = req.body;

  // check task information
  if (!taskName) {
    sendJsonResponse(res, 400, {
      message: "Task name format: {'taskName': 'name'}",
    });
    return;
  }
  if (!boardid || !listid) {
    sendJsonResponse(res, 400, {
      message: 'BoardID and listID are both required',
    });
    return;
  }

  // find board by id
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {
      if (!board) {
        sendJsonResponse(res, 404, {
          message: 'Board is not found',
        });
      } else if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        addTask(req, res, board);
      }
    });
};

// update task
module.exports.updateTask = (req, res) => {
  const {
    taskName: newTaskName,
    description: newTaskDescription,
    date: newTaskDate,
    status: newTaskStatus,
  } = req.body;
  const { boardid, listid, taskid } = req.params;

  // check task information
  if (!boardid || !listid || !taskid) {
    sendJsonResponse(res, 400, {
      message: 'BoardID, listID and taskID are all required',
    });
    return;
  }
  if (!newTaskDate && newTaskDate !== null) {
    sendJsonResponse(res, 400, {
      message: 'Wrong task date format',
    });
    return;
  }
  if (newTaskStatus !== true && newTaskStatus !== false) {
    sendJsonResponse(res, 400, {
      message: 'Wrong task status format',
    });
    return;
  }

  // find board by id
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {
      // check board
      if (!board) {
        sendJsonResponse(res, 404, {
          message: 'Board is not found',
        });
        return;
      }
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }

      // find list by id
      const list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          message: 'List is not found',
        });
        return;
      }

      // find task by id if it exists
      if (list.tasks && list.tasks.length > 0) {
        const task = list.tasks.id(taskid);
        if (!task) {
          sendJsonResponse(res, 404, {
            message: 'Task is not found',
          });
        } else {
          // update task information and save board
          // eslint-disable-next-line no-unused-expressions
          newTaskName ? (task.taskName = newTaskName) : task.taskName;
          // eslint-disable-next-line no-unused-expressions
          newTaskDescription
            ? (task.description = newTaskDescription)
            : (task.description = '');
          // eslint-disable-next-line no-unused-expressions
          newTaskDate === null ? (task.date = null) : (task.date = newTaskDate);
          // eslint-disable-next-line no-unused-expressions
          newTaskStatus === true ? (task.status = true) : (task.status = false);
          board.save((error, boardInfo) => {
            if (error) {
              sendJsonResponse(res, 404, error);
            } else {
              const newList = boardInfo.lists.id(listid);
              const newTask = newList.tasks.id(taskid);
              sendJsonResponse(res, 200, newTask);
            }
          });
        }
      } else {
        sendJsonResponse(res, 404, {
          message: 'Tasks is not found',
        });
      }
    });
};

// delete task
module.exports.deleteTask = (req, res) => {
  const { boardid, listid, taskid } = req.params;

  // check task information
  if (!boardid || !listid || !taskid) {
    sendJsonResponse(res, 400, {
      message: 'BoardID, listID and taskID are all required',
    });
    return;
  }

  // find board by id
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {
      // check board
      if (!board) {
        sendJsonResponse(res, 404, {
          message: 'Board is not found',
        });
        return;
      }
      if (err) {
        sendJsonResponse(res, 400, err);
        return;
      }

      // find list by id
      const list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          message: 'List is not found',
        });
        return;
      }

      // find task by id if it exists
      if (list.tasks && list.tasks.length > 0) {
        const task = list.tasks.id(taskid);
        if (!task) {
          sendJsonResponse(res, 404, {
            message: 'Task is not found',
          });
        } else {
          // remove task from db and folders with attachments
          const taskDirectoryPath = `app_client/lib/images/board_${boardid}/${list.listName}_${listid}/${task.taskName}_${taskid}`;
          task.remove();
          fs.removeSync(taskDirectoryPath);
          board.save(error => {
            if (error) {
              sendJsonResponse(res, 404, error);
            } else {
              sendJsonResponse(res, 204, null);
            }
          });
        }
      } else {
        sendJsonResponse(res, 404, {
          message: 'Tasks is not found',
        });
      }
    });
};
