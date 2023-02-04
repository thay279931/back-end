const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}
/* {
    "sid": 112,
    "shop_sid": 89,
    "deliver_sid": 1,
    "store_order_sid": 19,
    "deliver_order_sid": 1,
    "order_time": "2022-11-22T15:17:35.000Z",
    "order_total": 720,
    "coupon_sid": 0,
    "sale": 720,
    "pay_method": 0,
    "deliver_fee": 10,
    "total_amount": 6,
    "shopName": "I’m PASTA 和平店",
    "complete_time": "2022-11-21T15:32:52.000Z",
    "deliverName": "外送員01",
    "coupon_name": null
} */
router.get("/GetAllCompleteOrders", async (req, res) => {
  const memberSid = req.token.sid
  // console.log(memberSid);
  const sql = "SELECT o.`sid`, o.`shop_sid`, o.`deliver_sid`, o.`store_order_sid`, o.`deliver_order_sid`, o.`order_time`, o.`order_total`,o.`coupon_sid`,o.`sale`,o.`pay_method`,o.`deliver_fee`,o.`total_amount`,s.`name` shopName , s.`src` , do.`complete_time` ,d.`name` deliverName ,cc.`coupon_name`,de.`evaluation_score`  deliverScore ,se.`evaluation_score` shopScore FROM `orders` o LEFT JOIN `deliver_order` do ON o.`sid` = do.`order_sid` LEFT JOIN `deliver` d  ON d.`sid` = do.`deliver_sid` LEFT JOIN `shop` s ON s.`sid` = o.`shop_sid` LEFT JOIN `coupon` c ON c.`order_sid` = o.`sid` LEFT JOIN `coupon_content` cc ON cc.`sid` = c.`coupon_sid` LEFT JOIN `shop_evaluation` se ON se.`order_sid` = o.`sid` LEFT JOIN `deliver_evaluation` de ON de.`order_sid` = o.`sid`  WHERE o.`member_sid` = ? AND o.`order_complete` = 1 ORDER BY o.`order_time` DESC"
  const [result] = await DB.query(sql,memberSid)
  result.forEach((el)=>{
    el.orderId = 'M' + changeTime(el.order_time, 'YYMMDD') + el.sid
    el.order_date =  changeTime(el.order_time, 'YYYY年MM月DD日')
    el.order_time =  changeTime(el.order_time, 'YYYY/MM/DD HH:mm')
    el.complete_time =  changeTime(el.complete_time, 'YYYY/MM/DD HH:mm')
  })
  res.json(result)
})


router.get("/GetDropDetails", async (req, res) => {
  const orderSid = req.query.orderSid
  // const memberSid = req.token.sid
  const sql = "SELECT od.`order_sid`, od.`product_sid`, od.`product_price`, od.`amount`,p.`name`, p.`src` FROM `order_detail` od LEFT JOIN `products` p ON p.`sid` = od.`product_sid` WHERE od.`order_sid` = ?"
  const [result] =  await DB.query(sql,orderSid)

  //===============================================分隔線================================================
   //選項細節  放進商品清單裡面
  for(let element of result){
    const productSid = element.product_sid
    const optionSql = "SELECT `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`=? AND `product_sid` = ? "
    const [options] = await DB.query(optionSql,[orderSid,productSid])
    element.options = options
  } 

  res.json(result)
})

module.exports = router;