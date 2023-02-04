const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}
router.get("/GetAddress", async (req, res) => {
  const { side, orderSid }  = req.query
  console.log(orderSid);
  //{ side: '1', orderSid: '1' }
  const deliverSid = 1
  // console.log(deliverSid);
  //1
  const sql = "SELECT o.`receive_address` ,s.`name` shopName ,s.`address`, m.`name` memberName ,m.`sid` memberSid  FROM `orders` o LEFT JOIN `shop` s ON o.`shop_sid` = s.`sid` LEFT JOIN `member` m ON o.`member_sid` = m.`sid` WHERE o.`sid` = ? "
  // const sql = "SELECT o.`receive_address` ,s.`name` shopName ,s.`address`, m.`name` memberName FROM `orders` o LEFT JOIN `shop` s ON o.`shop_sid` = s.`sid` LEFT JOIN `member` m ON o.`member_sid` = m.`sid` WHERE o.`sid` = ? AND o.`deliver_sid` = ?"
  const [[result]] = await DB.query(sql,[orderSid])
  console.log(result);

  res.json(result)
})

router.get('/GetOrderStep',async (req,res)=>{
  const deliverSid = req.token.sid
  const { orderSid }  = req.query
  // console.log({ orderSid,deliverSid });
  const sql = "SELECT `member_sid` FROM `orders` WHERE `sid` = ? AND `deliver_sid` = ?"
  const [[result]] = await DB.query(sql,[orderSid,deliverSid])
  res.json(result)
})
router.get("/GetChattingContent", async (req, res) => {
  const orderSid = req.query.orderSid;
  if (!orderSid) {
    return res.json(0);
  }
  const sid = req.token.sid;
  const side = req.token.side;
  console.log({ orderSid, sid, side });
  // const sql = "SELECT o.`sid` orderSid, s.`name` shopName , s.`address` FROM `orders` o LEFT JOIN `shop` s ON o.`shop_sid` = s.`sid` WHERE o.`member_sid` = ? AND o.`sid` = ?"
  // const [[result]] = await DB.query(sql,[memberSid,orderSid])
  // console.log(result);

  const sql =
    "SELECT `sid`, `post_sid`, `post_side`, `receive_sid`, `receive_side`, `post_content`, `post_time`, `order_sid` FROM `messages` WHERE `order_sid`=? AND ((`post_sid` =? AND `post_side`=?) OR (`receive_sid` = ?  AND `receive_side` = ? )) ORDER BY post_time DESC";
  const [result] = await DB.query(sql, [orderSid,sid, side, sid, side]);
  result.forEach((v)=>{
    v.post_time= changeTime(v.post_time, 'MM/DD hh:mm:ss')
    v.post_content = v.post_content.slice(1,v.post_content.length - 1)
  })
  console.log(result);
  res.json(result);
});
//獲得取餐/未取餐狀態
router.get('/GetDeliveStep',async (req,res)=>{
  const orderSid = req.query.orderSid
  const checkStepSql = "SELECT `deliver_take` FROM `shop_order` WHERE `order_sid` = ?"
  const [[{deliver_take}]] = await DB.query(checkStepSql,orderSid)
  res.json(deliver_take);
})


module.exports = router;