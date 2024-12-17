import express from "express";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import {
  admin,
  protect,
  userRoleAdmin,
  userRoleInventory,
} from "../Middleware/AuthMiddleware.js";
import importStock from "./../Models/ImportStock.js";
import Product from "../Models/ProductModel.js";
import mongoose from "mongoose";
import Inventory from "../Models/InventoryModels.js";
import { logger } from "../utils/logger.js";
import moment from "moment";
import User from "../Models/UserModel.js";
import HistoryInventory from "../Models/HistoryInventory.js";
const day = moment(Date.now());

const importStockRoutes = express.Router();

// ADMIN GET ALL IMPORT STOCK
importStockRoutes.get(
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
// analytics stock import for app
importStockRoutes.get(
  "/analytics",
  // protect,
  // userRoleInventory,
  asyncHandler(async (req, res) => {
    const from = req.query.from;
    const to = req.query.to;
    const keySearch = req.query.keySearch;

    // Xây dựng điều kiện lọc
    const D2D = {
      ...((from && to) && {
        importedAt: {
          $gte: new Date(from) ,
          $lte: new Date(to),
        },
      }),
      status: true, // Điều kiện mặc định
    };

    const datas = await importStock.aggregate([
      {
        $match: D2D, // Lọc dữ liệu ban đầu
      },
      {
        $unwind: "$importItems", // Tách từng item trong importItems
      },
      {
        $lookup: {
          from: "products",
          localField: "importItems.product",
          foreignField: "_id",
          as: "productDetails", // Lưu kết quả lookup vào "productDetails"
        },
      },
      {
        $unwind: "$productDetails", // Tách các sản phẩm tìm thấy
      },
      {
        $group: {
          _id: {
            productId: "$productDetails._id",
            lotNumber: "$importItems.lotNumber",
            manufactureDate: "$importItems.manufactureDate",
          },
          name: { $first: "$productDetails.name" },
          lotNumber: { $first: "$importItems.lotNumber" },
          manufactureDate: { $first: "$importItems.manufactureDate" },
          inStockDate: { $first: "$importItems.inStockDate" },
          expProduct: { $first: "$importItems.expProduct" },
          image: { $first: "$productDetails.image" },
          qty: { $sum: "$importItems.qty" }, // Cộng dồn số lượng
          price: { $sum: { $multiply: ["$importItems.qty", "$importItems.price"] } }, // Tổng giá trị
        },
      },
      {
        $sort: { "_id.productId": 1 }, // Sắp xếp dữ liệu theo sản phẩm
      },
    ]);
    
    
    res.json([...datas]);
  })
);


// ADMIN GET ALL IMPORT STOCK
importStockRoutes.get(
  "/report-import",
  protect,
  userRoleInventory,
  asyncHandler(async (req, res) => {
    // Lấy 7 item gần nhất
    const stockImported = await importStock
      .find({ isDeleted: { $eq: false } })
      .populate("user", "name")
      .sort({ _id: -1 }) // Sắp xếp theo thứ tự mới nhất
      .limit(7); // Giới hạn chỉ lấy 7 kết quả

    res.json(stockImported);
  })
);



// ADMIN GET ALL IMPORT STOCK
importStockRoutes.get(
  "/get-history-inventory",
  protect,
  userRoleInventory,
  asyncHandler(async (req, res) => {
    
    const dataHistory = await  HistoryInventory.find({
      isDeleted: { $ne: true }
    })

    res.json(dataHistory);
  })
);



// //SEARCH DATE
// importStockRoutes.get("/date",
//     protect,
//     admin,
//     asyncHandler(async (req, res) => {
//         const pageSize = 9;
//         const currentPage = Number(req.query.pageNumber) || 1;
//         const from = req.query.from;
//         const to = req.query.to
//         const D2D = from && to ? {
//           importedAt: {
//               $gte: from,
//               $lt: to
//           },
//         } : {}
//         const count = await importStock.countDocuments({...D2D});
//         const stockImported = await importStock.find({...D2D}).populate(
//           "user",
//           "name"
//         ).populate(
//           "provider",
//           "name"
//         ).populate(
//           "importItems.product",
//           "name"
//         ).sort({ _id: -1 })
//         .limit(pageSize)
//         .skip(pageSize * (currentPage - 1))

//         const totalPage = [];
//         for(let i = 1; i <= Math.ceil(count / pageSize); i++){
//           totalPage.push(i)
//         }
//         res.json({ stockImported, currentPage, totalPage });
//     })
// )

// importStockRoutes.get(
//   "/",
//   protect,
//   admin,
//   asyncHandler(async (req, res) => {
//     const stockImported = await importStock.find({}).populate(
//       "user",
//       "name"
//     ).populate(
//       "provider",
//       "name"
//     ).populate(
//       "importItems.product",
//       "name"
//     ).sort({ _id: -1 })
//     res.json(stockImported);
//   })
// );

// CREATE IMPORT STOCK
importStockRoutes.post(
  "/",
  protect,
  userRoleInventory,
  asyncHandler(async (req, res) => {
    try {
      const {
        provider,
        importItems,
        user,
        totalPrice,
        totalVAT,
        totalDiscount,
        invoiceNumber,
        invoiceSymbol,
        importedAt,
      } = req.body;

      const randomUuid = crypto.randomBytes(16).toString("hex")
      let flag = false
      for (let i = 0; i < importItems.length; i++) {
        const updatedInventory = await Inventory.findOne(
          {
            $and: [
              { lotNumber: importItems[i].lotNumber },
              { idDrug:  mongoose.Types.ObjectId(importItems[i].product) },
            ]
          }
        )
        if(updatedInventory === null){
          flag = false
        }
        else{
          const manufactureDateFormat = new Date(updatedInventory?.manufactureDate)?.toISOString()?.split('T')[0]
          const expDrugFormat = new Date(updatedInventory?.expDrug)?.toISOString()?.split('T')[0]
          if(importItems[i]?.manufactureDate !== manufactureDateFormat || importItems[i]?.expDrug !== expDrugFormat){
            flag = true
            res.status(201).json({
              error: true,
              message: `Số lô ${updatedInventory?.lotNumber} đã có trong hệ thống nhưng khác ngày sản xuất và sử dụng, vui lòng nhập đúng`
            })
          }
        }
      }
      if(!flag){
        // code là Năm tháng ngày-stt-> 231201-0001
        const lastIssue = await importStock
          .find()
          .sort({ _id: -1 })
          .limit(1)
        let code = ''
        const today = moment().format('DDMMYY')

        if (lastIssue?.length > 0) {
          const lastCode = lastIssue[0]?.importCode
          const lastIssueDate = lastCode?.split(`${process.env.PREFIX_CODE_NK}`)[1]?.split('-')[0] // Lấy ngày từ mã code trước đó
          const lastCodeNumber = parseInt(lastCode?.split('-')?.[1])

          // Kiểm tra nếu ngày của lastIssue trùng với ngày hôm nay
          if (lastIssueDate === today) {
            // Nếu là cùng ngày, tăng số thứ tự
            code = `${process.env.PREFIX_CODE_NK}${today}-${(lastCodeNumber + 1).toString().padStart(4, '0')}`
          } else {
            // Nếu không phải cùng ngày, reset số thứ tự về 0001
            code = `${process.env.PREFIX_CODE_NK}${today}-0001`
          }
        } else {
          // Nếu không có lastIssue, bắt đầu với mã code mới
          code = `${process.env.PREFIX_CODE_NK}${today}-0001`
        }


        const importsStock = new importStock({
          importCode: code,
          user: user || req.user._id,
          provider,
          importItems,
          totalPrice,
          totalVAT,
          totalDiscount,
          invoiceNumber,
          invoiceSymbol,
          importedAt,
        });

        const createdImportStock = await importsStock.save();
        logger.info(
          `✏️ ${day.format("MMMM Do YYYY, h:mm:ss a")} Created Import Stock 👉 Post: 200`,
          { user: req.user.name, createdImportStock },
        );
        res.status(201).json(createdImportStock);
      }
    } catch (error) {
      res.status(400).json(error.message)
    }
  }),
);

// GET IMPORT STOCK BY ID
importStockRoutes.get(
  "/:id",
  protect,
  userRoleInventory,
  asyncHandler(async (req, res) => {
    const order = await importStock
      .findById(req.params.id)
      .populate("user", "name")
      .populate("provider", "name")
      .populate("importItems.product", "name image");

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Không tìm thấy đơn nhập kho");
    }
  }),
);

// UPDATE STATUS
importStockRoutes.put(
  "/:id/status",
  protect,
  userRoleAdmin,
  asyncHandler(async (req, res) => {
    try {
      const thisImport = await importStock.findById(req.params.id);
      if (thisImport) {
        for  (let i = 0; i < thisImport.importItems.length; i++) {
          const updatedInventory = await Inventory.findOneAndUpdate(
            {
              $and: [
                { idDrug: thisImport.importItems[i].product.toHexString() },
                { lotNumber: thisImport.importItems[i].lotNumber },
                { manufactureDate: thisImport.importItems[i].manufactureDate },
                { expDrug: thisImport.importItems[i].expDrug },
                { expProduct: thisImport.importItems[i].expProduct },
              ],
            },
            {
              $inc: { count: thisImport.importItems[i].qty },
              $push: {
                importStock: {
                  _id: thisImport._id,
                  importCode: thisImport.importCode,
                },
              },
            },
            {
              new: false,
            },
          );
          if (updatedInventory === null) {
            const newUser = {
              idDrug: thisImport.importItems[i].product.toHexString(),
              lotNumber: thisImport.importItems[i].lotNumber,
              manufactureDate: thisImport.importItems[i].manufactureDate,
              expDrug: thisImport.importItems[i].expDrug,
              inStockDate: thisImport?.importedAt,
              expProduct: thisImport.importItems[i].expProduct,
              count: +thisImport.importItems[i].qty,
              importStock: [
                {
                  _id: thisImport._id,
                  importCode: thisImport.importCode,
                },
              ],
            };
            await Inventory.create(newUser);
          }
        }
        thisImport.status = true;
        const updatedImport = await thisImport.save();

        const getUser = await User.findOne({
          _id: updatedImport?.user,
          isDeleted: { $ne: true }
        }).lean()


        await HistoryInventory.create({
          userName: getUser?.name,
          status: "Import", 
          total: updatedImport?.totalPrice + updatedImport?.totalVAT - updatedImport?.totalDiscount
        })

        logger.info(
          `✏️ ${day.format("MMMM Do YYYY, h:mm:ss a")} Import Stock Updated Status 👉 Post: 200`,
          { user: req.user.name, updatedImport },
        );
        res.json(updatedImport);
      } else {
        res.status(404);
        throw new Error("Không tìm thấy đơn nhập kho");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }),
);

//UPDATE IMPORTSTOCK
importStockRoutes.put(
  "/:id",
  protect,
  userRoleInventory,
  asyncHandler(async (req, res) => {
    try {
      const thisImport = await importStock.findById(req.params.id);
      const {
        provider,
        importItems,
        user,
        totalPrice,
        totalVAT,
        totalDiscount,
        invoiceNumber,
        invoiceSymbol,
        importedAt,
      } = req.body;

      let flag = false
      for (let i = 0; i < importItems.length; i++) {
        const updatedInventory = await Inventory.findOne(
          {
            $and: [
              { lotNumber: importItems[i].lotNumber },
              { idDrug:  typeof importItems[i].product === 'string' ? mongoose.Types.ObjectId(importItems[i].product) : mongoose.Types.ObjectId(importItems[i].product._id)},
            ]
          }
        )
        console.log('updatedInventory', updatedInventory)
        if(updatedInventory === null){
          flag = false
        }
        else{
          const manufactureDateFormat = new Date(updatedInventory?.manufactureDate)?.toISOString()?.split('T')[0]
          const expDrugFormat = new Date(updatedInventory?.expDrug)?.toISOString()?.split('T')[0]
          if(importItems[i]?.manufactureDate !== manufactureDateFormat || importItems[i]?.expDrug !== expDrugFormat){
            flag = true
            res.status(201).json({
              error: true,
              message: `Số lô ${updatedInventory?.lotNumber} đã có trong hệ thống nhưng khác ngày sản xuất và sử dụng, vui lòng nhập đúng`
            })
          }
        }
      }
      if (thisImport && !flag) {
        thisImport.provider = provider || thisImport.provider;
        thisImport.importItems = importItems || thisImport.importItems;
        thisImport.user = user || thisImport.user;
        thisImport.totalPrice = totalPrice || thisImport.totalPrice;
        thisImport.totalVAT = totalVAT || thisImport.totalVAT;
        thisImport.totalDiscount = totalDiscount || thisImport.totalDiscount;
        thisImport.invoiceNumber = invoiceNumber || thisImport.invoiceNumber;
        thisImport.invoiceSymbol = invoiceSymbol || thisImport.invoiceSymbol;
        thisImport.importedAt = importedAt || thisImport.importedAt;
        const updatedProduct = await thisImport.save();
        logger.info(
          `✏️ ${day.format("MMMM Do YYYY, h:mm:ss a")} Import Updated 👉 Post: 200`,
          { user: req.user.name, updatedProduct },
        );
        res.json(updatedProduct);
      } else {
        res.status(404);
        throw new Error("Không tìm thấy đơn nhập");
      }
    } catch (error) {
      res.status(400).json(error.message);
    }
  }),
);

//CANCEL IMPORT STOCK
importStockRoutes.put(
  "/:id/cancel",
  protect,
  userRoleAdmin,
  asyncHandler(async (req, res) => {
    try {
      const thisImport = await importStock.findById(req.params.id);
      if (thisImport) {
        thisImport.isDeleted = true;
        const updatedImport = await thisImport.save();
        logger.info(
          `✏️ ${day.format("MMMM Do YYYY, h:mm:ss a")} Import Stock Cancel 👉 Post: 200`,
          { user: req.user.name, updatedImport },
        );
        res.json(updatedImport);
      } else {
        res.status(404);
        throw new Error("Không tìm thấy đơn nhập");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }),
);




export default importStockRoutes;
