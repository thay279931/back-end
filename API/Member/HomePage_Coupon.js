const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}


router.use("/", async (req, res) => {
  const sql = "SELECT cc.*,s.`name` FROM `coupon_content` cc LEFT JOIN `shop` s ON s.`sid` = cc.`shop_sid` WHERE cc.`get_limit_time` > NOW() AND cc.`coupon_available` = 1 ORDER BY RAND() LIMIT 3"
  const [result] = await DB.query(sql)
  result.forEach((v,i)=>{
    v.expire = changeTime(v.expire,'YYYY/MM/DD')
    v.get_limit_time = changeTime(v.get_limit_time,'YYYY/MM/DD')
    if(v.shop_sid===101){
      v.name = '全站通用'
    }
  })

  res.json(result)
})

module.exports = router;