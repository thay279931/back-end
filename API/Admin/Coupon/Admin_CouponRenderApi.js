const express = require("express");
const router = express.Router();
const DB = require("../../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
const jwt = require('jsonwebtoken');

let parsedToken = null;
router.use("/", async (req, res, next) => {
  const tokenGet = req.header("Authorization").replace("Bearer ", "");
  //因為進來的時候會加Bearer 所以NULL會變文字
  if (tokenGet === "null") {
    //沒傳東西直接擋掉
    return res.json(0);
  }
  //先轉換再放回全域變數
  parsedToken = jwt.verify(tokenGet, process.env.JWT_SECRET);

  const loginSql =
    "SELECT `sid`, `name`, `email` FROM `shop` WHERE `email` = ? AND `name` = ? AND `sid` = ?";
  const { email, sid, name } = parsedToken;
  //不是101直接擋掉 不經過資料庫
  if (sid !== 101) {
    return res.json(0);
  }
  const [[result]] = await DB.query(loginSql, [email, name, sid]);
  if (!result) {
    return res.json(0);
  } else {
    next();
  }
});

router.use("/", async (req, res) => {
    const { email, sid, name } = parsedToken;
  //有登入才叫資料
  if (sid === 101) {
    const sql =
      "SELECT cc.*, s.name shop_name FROM `coupon_content` cc LEFT JOIN `shop` s ON s.`sid` = cc.`shop_sid` WHERE 1";

    let [getData] = await DB.query(sql);

    for (let element of getData) {
      //時間格式設定
      const expire = element.expire;
      if (expire) {
        element.expire = moment(expire)
          .tz("Asia/Taipei")
          .format("YYYY-MM-DD HH:mm:ss");
      }
      const getTime = element.get_limit_time;
      if (getTime) {
        element.get_limit_time = moment(getTime)
          .tz("Asia/Taipei")
          .format("YYYY-MM-DD HH:mm:ss");
      }
      element.coupon_complete =!!element.coupon_complete
      element.coupon_available=!!element.coupon_available
    }

    return res.json(getData);
  }
});
module.exports = router;
