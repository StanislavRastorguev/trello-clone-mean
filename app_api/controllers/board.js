const mongoose = require('mongoose');

const Board = mongoose.model('Board');

// json response and status code to client side
const sendJsonResponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

// get board or create if it doesn't exist
module.exports.readBoard = (req, res) => {
  Board.find().exec((err, board) => {
    if (board && board.length === 0) {
      Board.create({}, (error, newBoard) => {
        if (error) {
          sendJsonResponse(res, 404, error);
        } else {
          const boards = [newBoard];
          sendJsonResponse(res, 201, boards);
        }
      });
    } else if (err) {
      sendJsonResponse(res, 404, err);
    } else {
      sendJsonResponse(res, 200, board);
    }
  });
};

// update board information or color
module.exports.updateBoard = (req, res) => {
  // check information from client for update
  const { boardid } = req.params;
  const { color, lists } = req.body;
  if (!color || !lists) {
    sendJsonResponse(res, 400, {
      message: 'Color and lists are required',
    });
    return;
  }
  if (!boardid) {
    sendJsonResponse(res, 400, {
      message: 'Boardid is required',
    });
    return;
  }

  // find board by id
  Board.findById(boardid).exec((err, board) => {
    if (!board) {
      sendJsonResponse(res, 404, {
        message: 'Board not found',
      });
    } else if (err) {
      sendJsonResponse(res, 404, err);
    } else if (board.lists.length !== lists.length) {
      sendJsonResponse(res, 404, {
        message: 'Wrong array of lists',
      });
    } else {
      // update board and save
      // eslint-disable-next-line no-param-reassign
      board.color = color;
      // eslint-disable-next-line no-param-reassign
      board.lists = lists;
      board.save((error, newBoard) => {
        if (error) {
          sendJsonResponse(res, 404, error);
        } else {
          sendJsonResponse(res, 200, newBoard);
        }
      });
    }
  });
};
