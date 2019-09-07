const mongoose = require('mongoose');

const Board = mongoose.model('Board');
const fs = require('fs-extra');

// json response and status code to client side
const sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

// function for add attachments to the task in the database (path, name, id and date)
module.exports.createAttachment = (req, res) => {
  if (!req.file) {
    sendJsonResponse(res, 200, {
      message: 'FILE_WAS_NOT_SELECTED',
    });
    return;
  }

  const { boardid, listid, taskid } = req.params;
  const { listName, taskName } = req.body;
  const { originalname, destination, filename } = req.file;

  // check information for attachment
  if (!boardid || !listid || !taskid) {
    sendJsonResponse(res, 400, {
      message: 'BoardID, listID and taskID are all required',
    });
    return;
  }
  if (!listName || !taskName) {
    sendJsonResponse(res, 400, {
      message: 'listName and taskName are both required for file path',
    });
    return;
  }
  if (!originalname || !destination || !filename) {
    sendJsonResponse(res, 400, {
      message:
        'originalname, destination and filename are all required for file data',
    });
    return;
  }

  const strParse = destination.indexOf('/');
  const filePathCheck = destination.slice(strParse);
  const filePath = `/lib/images/board_${boardid}/${listName}_${listid}/${taskName}_${taskid}`;

  if (filePathCheck !== filePath) {
    sendJsonResponse(res, 404, {
      message: 'Wrong file path',
    });
    return;
  }

  // find board
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {
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

      // find list
      const list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          message: 'List is not found',
        });
        return;
      }

      if (list.tasks && list.tasks.length > 0) {
        // find task
        const task = list.tasks.id(taskid);
        if (!task) {
          sendJsonResponse(res, 404, {
            message: 'Task is not found',
          });
        } else {
          const attachmentForSave = {
            originalName: originalname,
            path: `${filePath}/${filename}`,
          };
          task.attachments.push(attachmentForSave);

          // save attachment to the task
          board.save((error, data) => {
            if (error) {
              sendJsonResponse(res, 404, error);
            } else {
              const listData = data.lists.id(listid);
              const taskData = listData.tasks.id(taskid);
              const attachmentData =
                taskData.attachments[taskData.attachments.length - 1];
              sendJsonResponse(res, 201, attachmentData);
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

// function to delete attachments from the task in the database
module.exports.deleteAttachment = (req, res) => {
  const { boardid, listid, taskid, attachmentid } = req.params;

  // check attachment information for delete
  if (!boardid || !listid || !taskid || !attachmentid) {
    sendJsonResponse(res, 400, {
      message: 'BoardID, listID, taskID and attachmentID are all required',
    });
    return;
  }

  // find board
  Board.findById(boardid)
    .select('lists')
    .exec((err, board) => {
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

      // find list
      const list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          message: 'List is not found',
        });
        return;
      }

      // find task
      const task = list.tasks.id(taskid);
      if (!task) {
        sendJsonResponse(res, 404, {
          message: 'Task is not found',
        });
      }

      if (task.attachments && task.attachments.length > 0) {
        const attachment = task.attachments.id(attachmentid);
        if (!attachment) {
          sendJsonResponse(res, 404, {
            message: 'Attachment is not found',
          });
        } else {
          // remove attachment from task
          attachment.remove();
          // delete a file from a folder
          fs.removeSync(`app_client${attachment.path}`);
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
          message: 'Attachments is not found',
        });
      }
    });
};
