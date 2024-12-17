import express from "express";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import {
  admin,
  protect,
  userRoleAdmin,
  userRoleInventory,
} from "../Middleware/AuthMiddleware.js";
import importStock from "../Models/ImportStock.js";
import Product from "../Models/ProductModel.js";
import mongoose from "mongoose";
import Inventory from "../Models/InventoryModels.js";
import { logger } from "../utils/logger.js";
import moment from "moment";
import User from "../Models/UserModel.js";
import HistoryInventory from "../Models/HistoryInventory.js";
const day = moment(Date.now());

const reportRevenueRoutes = express.Router();

// ADMIN GET ALL IMPORT STOCK
reportRevenueRoutes.get(
  "/",
  protect,
  userRoleInventory,
  asyncHandler(async (req, res) => {
    // const pageSize = 9;
    // const currentPage = Number(req.query.pageNumber) || 1;
    const keyword =
      req.query.keyword && req.query.keyword != " "
        ? {
            importCode: {
              $regex: req.query.keyword,
              $options: "i",
            },
          }
        : {};

    const from = req.query.from;
    const to = req.query.to;
    const D2D =
      from && to
        ? {
            importedAt: {
              $gte: from,
              $lte: to,
            },
          }
        : {};
    // const count = await importStock.countDocuments({...keyword, ...D2D});
    const stockImported = await importStock
      .find({ ...keyword, ...D2D, isDeleted: { $eq: false } })
      .populate("user", "name")
      .populate("provider", "name address phone")
      .populate("importItems.product", "name image")
      .sort({ _id: -1 });
    // .limit(pageSize)
    // .skip(pageSize * (currentPage - 1))

    // const totalPage = [];
    // for(let i = 1; i <= Math.ceil(count / pageSize); i++){
    //   totalPage.push(i)
    // }
    // res.json({ stockImported, currentPage, totalPage });
    res.json(stockImported);
  }),
);





export default reportRevenueRoutes;
