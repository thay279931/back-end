const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

function changeTime(oldTime,form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}

//結帳頁 優惠券資料(資料)
router.get("/PayGetCouponDetail", async (req, res) => {
  const memberSid = req.token.sid;
  const shopSid = req.query.shopSid || 89;
  const sql =
    "SELECT c.* ,cc.`coupon_name`,cc.`shop_sid`,cc.`sale_detail`,cc.`use_range`  FROM `coupon` c LEFT JOIN `coupon_content` cc ON c.`coupon_sid`= cc.`sid`  WHERE c.`member_sid`= ? AND c.is_used = 0 AND cc.`expire` > NOW() AND (cc.`shop_sid` = ? OR cc.`shop_sid` = 101)";
  const [result] = await DB.query(sql, [memberSid, shopSid]);
  // for in 的EL  是 KEY值   for of 是內容
  for(let element of result){
    console.log(element);
    element.expire = changeTime(element.expire,"YY/MM/DD")
    element.get_time = changeTime(element.get_time,"YY/MM/DD")
  }
  res.json(result);
});

//結帳頁 會員資料(資料)
router.get("/PayGetProfile", async (req, res) => {
  const sql = "SELECT `name`,`phone`,email FROM `member` where `sid` = ?";
  const [[result]] = await DB.query(sql, req.token.sid);
  res.json(result);
});





router.use("/", async (req, res) => {
  res.json(1)
})

module.exports = router;