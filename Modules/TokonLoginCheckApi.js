const express = require("express");
const router = express.Router();
const DB = require('../Modules/ConnectDataBase');
const moment = require("moment-timezone");
const jwt = require('jsonwebtoken');

//Token登入檢查 配合React 

//定義空字串 因為要往下傳所以設在全域
let parsedToken = null;
router.use("/",(req,res,next)=>{
  if(!req.header('Authorization')){
    return res.json(0);
  }
  const tokenGet = req.header('Authorization').replace('Bearer ', '')
  //因為進來的時候會加Bearer 所以NULL會變文字
  if(tokenGet==="null"){
    //沒傳東西直接擋掉
    return res.json(0);
  }
  else {
    //先轉換再放回全域變數
    parsedToken = jwt.verify(tokenGet, process.env.JWT_SECRET);
    next();
  }
})
//會員登入檢查
router.use("/Member",async (req,res)=>{
  const loginSql = "SELECT `sid`, `name`, `email` FROM `member` WHERE `email` = ? AND `name` = ? AND `sid` = ?";
  const {email,sid,name} = parsedToken
  const [[result]] = await DB.query(loginSql, [email,name,sid]);
  if(!result){
    return res.json(0);
  }
  else{
    return res.json(1);
  }
})
//店家登入檢查
router.use("/Store", async (req,res)=>{
  const loginSql = "SELECT `sid`, `name`, `email` FROM `shop` WHERE `email` = ? AND `name` = ? AND `sid` = ?";
  const {email,sid,name} = parsedToken
  const [[result]] = await DB.query(loginSql, [email,name,sid]);
  if(!result){
    return res.json(0);
  }
  else{
    return res.json(1);
  }
})
//外送員登入檢查
router.use("/Deliver", async (req,res)=>{
  const loginSql = "SELECT `sid`, `name`, `email` FROM `deliver` WHERE `email` = ? AND `name` = ? AND `sid` = ?";
  const {email,sid,name} = parsedToken
  const [[result]] = await DB.query(loginSql, [email,name,sid]);
  if(!result){
    return res.json(0);
  }
  else{
    return res.json(1);
  }
})
//管理者登入檢查
router.use("/Admin", async (req,res)=>{
  const loginSql = "SELECT `sid`, `name`, `email` FROM `shop` WHERE `email` = ? AND `name` = ? AND `sid` = ?";
  const {email,sid,name} = parsedToken
  //不是101直接擋掉 不經過資料庫
  if(sid!==101){
    return res.json(0);
  }
  const [[result]] = await DB.query(loginSql, [email,name,sid]);
  if(!result){
    return res.json(0);
  }
  else{
    return res.json(1);
  }
})

module.exports = router;