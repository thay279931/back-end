const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}

router.get('/GetDeliverName',async(req,res)=>{
  const orderSid = req.query.orderSid
  const memberSid = req.token.sid
  const sql = "SELECT d.`name` FROM `orders` o LEFT JOIN `deliver` d ON d.`sid` = o.`deliver_sid` WHERE o.`sid` = ? AND o.`member_sid` = ?"
  const [[result]] = await DB.query(sql,[orderSid,memberSid])
  res.json(result)
})

router.get('/GetDeliverSid',async(req,res)=>{
  const orderSid = req.query.orderSid
  const memberSid = req.token.sid
  const sql = "SELECT `deliver_sid` FROM `orders` WHERE `sid` = ? AND `member_sid` = ?"
  const [[{deliver_sid}]] = await DB.query(sql,[orderSid,memberSid])
  res.json(deliver_sid)
})
router.get('/GetShopSid',async(req,res)=>{
  const orderSid = req.query.orderSid
  const memberSid = req.token.sid
  const sql = "SELECT `shop_sid` FROM `orders` WHERE `sid` = ? AND `member_sid` = ?"
  const [[{shop_sid}]] = await DB.query(sql,[orderSid,memberSid])
  res.json(shop_sid)
})
router.get("/GetStoreDetail", async (req, res) => {
  const orderSid = req.query.orderSid;
  if (!orderSid) {
    return res.json(0);
  }
  const memberSid = req.token.sid;
  // console.log({orderSid,memberSid});
  const sql =
    "SELECT o.`sid` orderSid, s.`name` shopName , s.`address` FROM `orders` o LEFT JOIN `shop` s ON o.`shop_sid` = s.`sid` WHERE o.`member_sid` = ? AND o.`sid` = ?";
  const [[result]] = await DB.query(sql, [memberSid, orderSid]);
  const detailSql = "SELECT `sid`, `name`, `price`, `options_type_sid`, `option_order` FROM `options` WHERE 1"
  // console.log(result);
  res.json(result);
});
router.get("/GetOrderAddress", async (req, res) => {
  const orderSid = req.query.orderSid;
  if (!orderSid) {
    return res.json(0);
  }
  const memberSid = req.token.sid;
  // console.log({orderSid,memberSid});
  const sql =
    "SELECT o.`receive_address` FROM `orders` o LEFT JOIN `shop` s ON o.`shop_sid` = s.`sid` WHERE o.`member_sid` = ? AND o.`sid` = ?";
  const [[result]] = await DB.query(sql, [memberSid, orderSid]);
  const detailSql = "SELECT `sid`, `name`, `price`, `options_type_sid`, `option_order` FROM `options` WHERE 1"
  // console.log(result);
  res.json(result);
});
//
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

module.exports = router;
