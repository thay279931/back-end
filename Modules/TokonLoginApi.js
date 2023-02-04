const express = require("express");
const router = express.Router();
const DB = require("../Modules/ConnectDataBase");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
//===============================================分隔線================================================
//會員
router.use("/Member", async (req, res) => {
  const output = {
    errorType: "",
    success: false,
    token: null,
  };

  const datas = req.body;

  const email = datas.email.trim();
  const password = datas.password.trim();

  if (!email || !password) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  }
  const loginSql =
    "SELECT `sid`, `name`, `email`, `password` FROM `member` WHERE `email` LIKE ? ";

  let [[result]] = await DB.query(loginSql, [email]);
  if (!result) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  }
  let passStat = false;
  await bcrypt.compare(password, result.password) === true ? (passStat = true) : null;
  console.log('會員登入' + result);
  if (!result) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  } 
  if (!passStat) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  } else {
    output.success = true;
    const signToken = jwt.sign({
      sid: result.sid, email: result.email, name: result.name,
      side: 1
    }, process.env.JWT_SECRET);
    output.token = signToken;
    output.name = result.name
    output.sid = String(result.sid);
    return res.json(output);
  }
});
//===============================================分隔線================================================
//店家+管理員
router.use("/Store", async (req, res) => {
  const output = {
    errorType: "",
    success: false,
    token: null,
  };

  const datas = req.body;

  const email = datas.email;
  const password = datas.password;

  if (!email || !password) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  }
  const loginSql =
    "SELECT `sid`, `name`, `email`, `password` FROM `shop` WHERE `email` = ? ";

  let [[result]] = await DB.query(loginSql, [email]);

  if (!result) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  }
  let passStat = false;
  result.password === password ? (passStat = true) : null;
  if (!passStat) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  } else if (result.sid === 101) {
    output.success = true;
    const signToken = jwt.sign(
      {
        sid: result.sid,
        email: result.email,
        name: result.name,
        side: 4
      },
      process.env.JWT_SECRET
    );
    output.token = signToken;
    output.adminToken = signToken;
    output.name = result.name
    return res.json(output);
  } else {
    output.success = true;
    const signToken = jwt.sign(
      {
        sid: result.sid,
        email: result.email,
        name: result.name,
        side: 2
      },
      process.env.JWT_SECRET
    );
    output.showedData = {
      sid: result.sid,
      name: result.name,
    }
    output.token = signToken;
    output.name = result.name

    return res.json(output);
  }
});
//===============================================分隔線================================================
//外送員
router.use("/Deliver", async (req, res) => {
  const output = {
    errorType: "",
    success: false,
    token: null,
  };

  const datas = req.body;

  const email = datas.email;
  const password = datas.password;

  if (!email || !password) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  }
  const loginSql = "SELECT * FROM `deliver` WHERE `email` = ? ";

  let [[result]] = await DB.query(loginSql, [email]);

  if (!result) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  }
  let passStat = false;
  result.password === password ? (passStat = true) : null;
  if (!passStat) {
    output.errorType = "帳號或密碼錯誤";
    return res.json(output);
  } else {
    output.success = true;
    const signToken = jwt.sign(
      {
        sid: result.sid,
        email: result.email,
        name: result.name,
        side: 3
      },
      process.env.JWT_SECRET
    );
    output.name = result.name
    output.token = signToken;
    return res.json(output);
  }
});
//===============================================分隔線================================================

module.exports = router;
