const mongoose = require('mongoose');

const Board = mongoose.model('Board');
const fs = require('fs-extra');

// json response and status code to client side
const sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

// function for add list on the board
const addList = (req, res, board) => {
  if (!board) {
    sendJsonResponse(res, 404, {
      message: 'Board not found',
    });
  } else {
    board.lists.push({
      listName: req.body.listName,
    });
    board.save((err, boardInfo) => {
      if (err) {
        sendJsonResponse(res, 404, err);
      } else {
        const list = boardInfo.lists[boardInfo.lists.length - 1];
        sendJsonResponse(res, 201, list);
      }
    });
  }
};

// create list on the board
module.exports.createList = (req, res) => {
  const { boardid } = req.params;
  const { listName } = req.body;

  if (!listName) {
    sendJsonResponse(res, 400, {
      message: "List name format: {'listName': 'name'}",
    });
    return;
  }

  if (boardid) {
    // find board by id
    Board.findById(boardid)
      .select('lists')
      .exec((err, board) => {
        if (err) {
          sendJsonResponse(res, 404, err);
        } else {
          addList(req, res, board);
        }
      });
  } else {
    sendJsonResponse(res, 400, {
      message: 'Boardid is required',
    });
  }
};

// update list
module.exports.updateList = (req, res) => {
  const { boardid, listid } = req.params;
  const { listName } = req.body;

  // check list information
  if (!listName) {
    sendJsonResponse(res, 400, {
      message: "List name format: {'listName': 'name'}",
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
      // find list by id
      const list = board.lists.id(listid);
      if (!list) {
        sendJsonResponse(res, 404, {
          message: 'List is not found',
        });
      } else {
        // update list name
        list.listName = listName;
        board.save((error, boardInfo) => {
          if (error) {
            sendJsonResponse(res, 404, error);
          } else {
            const updatedList = boardInfo.lists.id(listid);
            sendJsonResponse(res, 200, updatedList);
          }
        });
      }
    });
};

// delete list
module.exports.deleteList = (req, res) => {
  // check list information
  const { boardid, listid } = req.params;
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
          message: 'lists not found',
        });
        return;
      }
      if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      if (board.lists && board.lists.length > 0) {
        if (!board.lists.id(listid)) {
          sendJsonResponse(res, 404, {
            message: 'list not found',
          });
        } else {
          // find list by id
          const list = board.lists.id(listid);
          const listDirectoryPath = `app_client/lib/images/board_${boardid}/${list.listName}_${listid}`;

          // remove list and folders with attachments
          list.remove();
          fs.removeSync(listDirectoryPath);
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
          message: 'list not found',
        });
      }
    });
};
