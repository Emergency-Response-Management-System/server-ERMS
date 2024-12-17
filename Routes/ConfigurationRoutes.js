import express, { application } from "express";
import asyncHandler from "express-async-handler";
import moment from "moment";
import { protect, admin, userRoleAdmin } from "../Middleware/AuthMiddleware.js";
import multer from "multer";
import cors from "cors";
import { logger } from "../utils/logger.js";
import Configuration from "../Models/ConfigurationModel.js";
const configurationRouter = express.Router();
const day = moment(Date.now());

configurationRouter.use(cors());
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// Single File Route Handler
configurationRouter.post("/single", upload.single("image"), (req, res) => {
  const file = req.file;
  if (!file) {
    const error = new Error("Vui lòng tải file lên");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.json(file);
});

//GET One
configurationRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const category = await Configuration.findOne({ _id: 'default' });
    res.json(category);
  }),
);


//UPDATE CATEGORY
configurationRouter.put(
  "/:id",
  protect,
  userRoleAdmin,
  asyncHandler(async (req, res) => {
    const { nameWeb, logo, avatarDefault, backgroundLogin, colorDefault, quantityWarning, quantityDate } = req.body;

    const updatedCategory = await Configuration.findOneAndUpdate(
      {
        _id: 'default'
      }, 
      {
        $set: {
          nameWeb,
          logo,
          avatarDefault,
          backgroundLogin,
          colorDefault,
          quantityWarning,
          quantityDate
        }
      },
      {
        upsert: true
      }
    )


    if (updatedCategory) {
      logger.info(
        `✏️ ${day.format("MMMM Do YYYY, h:mm:ss a")} Updated Configuration 👉 Post: 200`,
        { user: req.user.name, updatedCategory },
      );
      res.json(updatedCategory);
      
    } else {
      res.status(404);
      throw new Error("Cấu hình lỗi");
    }
  }),
);
export default configurationRouter;
