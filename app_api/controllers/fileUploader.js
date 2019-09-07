const multer = require('multer');
const crypto = require('crypto');
const mime = require('mime');
const fs = require('fs-extra');

// create path and name for attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { listName, taskName } = req.body;
    const { boardid, listid, taskid } = req.params;

    fs.ensureDir(
      `app_client/lib/images/board_${boardid}/${listName}_${listid}/${taskName}_${taskid}`
    )
      .then(() => {
        cb(
          null,
          `app_client/lib/images/board_${boardid}/${listName}_${listid}/${taskName}_${taskid}`
        );
      })
      .catch(err => {
        cb(err);
      });
  },
  filename: (req, file, cb) => {
    crypto.pseudoRandomBytes(16, (err, raw) => {
      cb(
        null,
        `${raw.toString('hex') + Date.now()}.${mime.getExtension(
          file.mimetype
        )}`
      );
    });
  },
});

// upload file in folder
module.exports.upload = multer({
  storage,
  limits: { fileSize: 10485760 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/bmp'
    ) {
      cb(null, true);
    } else {
      const err = new Error('FILE_TYPE');
      cb(err);
    }
  },
}).single('attachmentFile');
