import express from "express";
import User from "./Models/UserModel.js";
import users from "./data/User.js";
import products from "./data/Products.js";
import Product from "./Models/ProductModel.js";
import asyncHandler from "express-async-handler";
import { admin, protect, userRoleAdmin } from "./Middleware/AuthMiddleware.js";
import mongoose from "mongoose";
import Category from "./Models/CategoryModel.js";
import fs from "fs";
const ImportData = express.Router();

ImportData.post(
  "/user",
  asyncHandler(async (req, res) => {
    await User.remove({});
    const importUser = await User.insertMany(users);
    res.send({ importUser });
  }),
);

ImportData.post(
  "/products",
  protect,
  userRoleAdmin,
  asyncHandler(async (req, res) => {
    const data = req.body;
    const contents = fs.readFileSync("./data/unit.json", "utf8");
    const dataUnit = JSON.parse(contents);
    
    const ExcludeUnit = [...new Set(data?.filter((item) => !dataUnit?.includes(item?.unit))?.map((item)=> item?.unit?.trim())?.filter(Boolean))];

    if(ExcludeUnit?.length){
      await dataUnit.push(...ExcludeUnit);
      fs.writeFileSync("./data/unit.json", JSON.stringify(dataUnit), "utf-8");
    }
    const importProducts = await Product.insertMany(data);
    res.send({ importProducts });
  }),
);

ImportData.post(
  "/unit",
  asyncHandler(async (req, res) => {
    try {
      const name = req.body.name;
      const contents = fs.readFileSync("./data/unit.json", "utf8");
      const data = JSON.parse(contents);
      await data.push(name);
      fs.writeFileSync("./data/unit.json", JSON.stringify(data), "utf-8");
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.get(
  "/unit",
  asyncHandler(async (req, res) => {
    if (!fs.existsSync("./data/unit.json")) {
      const data = [];
      fs.appendFileSync(`./data/unit.json`, JSON.stringify(data));
    }
    const contents = fs.readFileSync("./data/unit.json", "utf8");
    const data = JSON.parse(contents);
    res.send(data);
  }),
);

ImportData.delete(
  "/unit/:index",
  asyncHandler(async (req, res) => {
    try {
      const index = req.params.index;
      const contents = fs.readFileSync("./data/unit.json", "utf8");
      const data = JSON.parse(contents);
      await data.splice(index, 1);
      fs.writeFileSync("./data/unit.json", JSON.stringify(data), "utf-8");
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.post(
  "/countryOfOrigin",
  asyncHandler(async (req, res) => {
    try {
      const name = req.body.name;
      const contents = fs.readFileSync("./data/countryOfOrigin.json", "utf8");
      const data = JSON.parse(contents);
      await data.push(name);
      fs.writeFileSync(
        "./data/countryOfOrigin.json",
        JSON.stringify(data),
        "utf-8",
      );
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.get(
  "/countryOfOrigin",
  asyncHandler(async (req, res) => {
    if (!fs.existsSync("./data/countryOfOrigin.json")) {
      const data = [];
      fs.appendFileSync(`./data/countryOfOrigin.json`, JSON.stringify(data));
    }
    const contents = fs.readFileSync("./data/countryOfOrigin.json", "utf8");
    const data = JSON.parse(contents);
    res.send(data);
  }),
);

ImportData.delete(
  "/countryOfOrigin/:index",
  asyncHandler(async (req, res) => {
    try {
      const index = req.params.index;
      const contents = fs.readFileSync("./data/countryOfOrigin.json", "utf8");
      const data = JSON.parse(contents);
      await data.splice(index, 1);
      fs.writeFileSync(
        "./data/countryOfOrigin.json",
        JSON.stringify(data),
        "utf-8",
      );
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.post(
  "/manufacturer",
  asyncHandler(async (req, res) => {
    try {
      const name = req.body.name;
      const contents = fs.readFileSync("./data/manufacturer.json", "utf8");
      const data = JSON.parse(contents);
      await data.push(name);
      fs.writeFileSync(
        "./data/manufacturer.json",
        JSON.stringify(data),
        "utf-8",
      );
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.get(
  "/manufacturer",
  asyncHandler(async (req, res) => {
    if (!fs.existsSync("./data/manufacturer.json")) {
      const data = [];
      fs.appendFileSync(`./data/manufacturer.json`, JSON.stringify(data));
    }
    const contents = fs.readFileSync("./data/manufacturer.json", "utf8");
    const data = JSON.parse(contents);
    res.send(data);
  }),
);

ImportData.delete(
  "/manufacturer/:index",
  asyncHandler(async (req, res) => {
    try {
      const index = req.params.index;
      const contents = fs.readFileSync("./data/manufacturer.json", "utf8");
      const data = JSON.parse(contents);
      await data.splice(index, 1);
      fs.writeFileSync(
        "./data/manufacturer.json",
        JSON.stringify(data),
        "utf-8",
      );
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.post(
  "/API",
  asyncHandler(async (req, res) => {
    try {
      const name = req.body.name;
      const contents = fs.readFileSync("./data/API.json", "utf8");
      const data = JSON.parse(contents);
      await data.push(name);
      fs.writeFileSync("./data/API.json", JSON.stringify(data), "utf-8");
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

ImportData.get(
  "/API",
  asyncHandler(async (req, res) => {
    if (!fs.existsSync("./data/API.json")) {
      const data = [];
      fs.appendFileSync(`./data/API.json`, JSON.stringify(data));
    }
    const contents = fs.readFileSync("./data/API.json", "utf8");
    const data = JSON.parse(contents);
    res.send(data);
  }),
);

ImportData.delete(
  "/API/:index",
  asyncHandler(async (req, res) => {
    try {
      const index = req.params.index;
      const contents = fs.readFileSync("./data/API.json", "utf8");
      const data = JSON.parse(contents);
      await data.splice(index, 1);
      fs.writeFileSync("./data/API.json", JSON.stringify(data), "utf-8");
      res.send(data);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }),
);

export default ImportData;
