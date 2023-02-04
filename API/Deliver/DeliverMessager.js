const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}

router.use("/:sid", async (req, res, next) => {
  
  //路徑:deliverSellAnalyze/:sid

  let sid = req.params.sid;
  console.log("外送員sid:" , sid)

  // 測試用
  // let storeSid = 89;

  // TODO:折線圖
  // X:日期 Y:金額
  // 長條圖(這個月到今天為止 title:XX月商品銷售量)
  // X:商品名 Y:數量

  //計算所有訂單加總
  // let sql = `SELECT sum(order_total) AS order_total , order_time FROM orders WHERE shop_sid = ${sid} GROUP BY day(order_time) ORDER BY order_time `;

  //可將輸出的訂單時間變為最近的小時 (ex 23:12 -> 23:00)
  // let sql = `SELECT sum(order_total) AS order_total , DATE_ADD(DATE_FORMAT(order_time, "%Y-%m-%d %H:00:00"),INTERVAL IF(MINUTE(order_time) < 30, 0, 1) HOUR) AS order_time FROM orders WHERE shop_sid = 89 GROUP BY day(order_time) ORDER BY order_time `;

  //單日銷售額(減去30天)
  // let sql = `SELECT sum(order_total) AS order_total , DATE_FORMAT(order_time - INTERVAL 30 DAY, "%Y-%m-%d") AS order_time FROM orders_test WHERE shop_sid = ${sid} GROUP BY day(order_time) ORDER BY order_time `;
  
  //7日內每日外送額
  // let sql = `SELECT sum(deliver_fee) AS deliver_fee , DATE_FORMAT(order_time + INTERVAL 7 DAY, "%Y-%m-%d") AS order_time FROM orders_test WHERE orders_test.deliver_sid = 1 GROUP BY day(order_time) ORDER BY order_time  `;

  //7日內每日外送額+完成訂單量
  let sql = `SELECT sum(deliver_fee) AS deliver_fee , COUNT(*) AS order_count , DATE_FORMAT(order_time + INTERVAL 7 DAY, "%Y-%m-%d") AS order_time FROM orders_test WHERE deliver_sid = ${sid} GROUP BY day(order_time) ORDER BY order_time `;

  let [result] = await DB.query(sql);

  result.forEach((el)=>{
    el.order_time =  changeTime(el.order_time, 'YYYY/MM/DD')
  })

  res.json(result);
});



module.exports = router;
