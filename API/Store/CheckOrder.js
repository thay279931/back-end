const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
//未接單 概覽
router.use("/checkDisConfirm", async (req, res) => {

  let storeSid = req.token.sid;

  let sql =
    "SELECT o.`sid`, o.`member_sid`, o.`shop_sid`, o.`store_order_sid`, o.`shop_memo`, o.`order_time`, o.`order_total`,  o.`sale`, o.`paid`, o.`pay_method`, o.`cook_time`,o.`total_amount`, m.`name` FROM `orders` o LEFT JOIN `member` m ON m.`sid` = o.`member_sid` WHERE o.`shop_sid` = ? AND o.`shop_order_status` = 0  ORDER BY o.`order_time` DESC";

  let [getData] = await DB.query(sql, storeSid);



  getData.forEach((element) => {
    const time = element.order_time;
    const timeChanged = moment(time)
      .tz("Asia/Taipei")
      .format("HH:mm:ss");
    element.order_time = timeChanged;
    element.orderNumber = 'S' + element.sid + element.shop_sid + element.member_sid
  });


  res.json(getData);
  return 
});

//未接單 細節 傳訂單SID進來
router.use("/checkDisConfirmDetail", async (req, res) => {
  // console.log(req.body);
  // return res.json(1)
  const orderSid = req.body.orderSid
  let storeSid = req.token.sid;
  //訂單內容
  const checkOrderSql = "SELECT o.*, m.`name` memberName FROM `orders` o LEFT JOIN `member` m ON o.`member_sid` = m.`sid` WHERE o.`sid` = ? AND o.`shop_sid` = ?"
  const [[getData]] = await DB.query(checkOrderSql, [orderSid, storeSid]);
  //商品細節
  const productDetailSql = "SELECT od.* , p.`name` productName FROM `order_detail` od LEFT JOIN `products` p ON od.`product_sid` = p.`sid`    WHERE od.`order_sid` = ?"
  const [productDetails] = await DB.query(productDetailSql, orderSid);
  for (element of productDetails) {
    const detailSql = "SELECT  `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`= ? AND `product_sid` = ? "
    const detailQueryData = [orderSid, element.product_sid]
    const [detailData] = await DB.query(detailSql, detailQueryData)
    element.detail = detailData
  }

  const time = getData.order_time;
  const timeChanged = moment(time)
    .tz("Asia/Taipei")
    .format("HH:mm:ss");
  getData.order_time = timeChanged;
  getData.orderNumber = 'S' + getData.sid + getData.shop_sid + getData.member_sid


  const output = { getData, productDetails }
  /*{
    "getData": {
        "sid": 189,
        "member_sid": 1,
        "shop_sid": 89,
        "deliver_sid": null,
        "store_order_sid": null,
        "deliver_order_sid": null,
        "shop_memo": "",
        "deliver_memo": "",
        "order_time": "22:59:33",
        "order_total": 135,
        "coupon_sid": 0,
        "sale": 135,
        "paid": 1,
        "pay_method": 1,
        "LinePayID": "2022113000733859110",
        "daily_coupon_sid": 0,
        "deliver_fee": 10,
        "cook_time": 40,
        "shop_order_status": 0,
        "deliver_order_status": 0,
        "total_amount": 1,
        "receive_name": "ゆう",
        "receive_phone": "0952400241",
        "receive_address": "台北市大安區復興南路一段390號2樓",
        "order_complete": 0,
        "memberName": "ゆう",
        "orderNumber": "S189891"
    },
    "productDetails": [
        {
            "sid": 463,
            "order_sid": 189,
            "product_sid": 1111,
            "product_price": 135,
            "amount": 1,
            "productName": "奶油蔬菜鮭魚麵",
            "detail":{
                        "option_detail_sid": 1,
                        "options": "加起司",
                        "option_price": 10
                    }
        }
    ]
    
} */
res.json(output);
  return 

});

//已接單 概覽
router.use("/checkConfirmed", async (req, res) => {

  let storeSid = req.token.sid;

  let sql =
    "SELECT o.`sid`, o.`member_sid`, o.`shop_sid`, o.`store_order_sid`, o.`order_time`, o.`order_total`, o.`sale`, o.`deliver_fee`, o.`shop_order_status`,o.`total_amount`, m.`name` ,so.`shop_accept_time` FROM `orders` o LEFT JOIN `member` m ON m.`sid` = o.`member_sid` LEFT JOIN `shop_order` so ON o.`store_order_sid` = so.`sid` WHERE o.`shop_order_status` =1 AND o.`shop_sid` = ? AND so.`cook_finish` = 0 ORDER BY so.`shop_accept_time` DESC";

  let [getData] = await DB.query(sql, storeSid);

  getData.forEach((element) => {
    const time = element.order_time;
    const timeChanged = moment(time)
      .tz("Asia/Taipei")
      .format("HH:mm:ss");
    element.order_time = timeChanged;
    element.orderNumber = 'S' + element.sid + element.shop_sid + element.member_sid
    element.shop_accept_time = moment(element.shop_accept_time)
      .tz("Asia/Taipei")
      .format("HH:mm:ss")
  });
  res.json(getData);
  return 
});
//已接單 細節
router.use("/checkConfirmedDetail", async (req, res) => {

  // console.log(req.body);
  // return res.json(1)
  const orderSid = req.body.orderSid
  let storeSid = req.token.sid;
  //訂單內容
  const checkOrderSql = "SELECT o.*, m.`name` memberName FROM `orders` o LEFT JOIN `member` m ON o.`member_sid` = m.`sid` WHERE o.`sid` = ? AND o.`shop_sid` = ?"
  const [[getData]] = await DB.query(checkOrderSql, [orderSid, storeSid]);
  //商品細節
  const productDetailSql = "SELECT od.* , p.`name` productName FROM `order_detail` od LEFT JOIN `products` p ON od.`product_sid` = p.`sid`    WHERE od.`order_sid` = ?"
  const [productDetails] = await DB.query(productDetailSql, orderSid);
  for (element of productDetails) {
    const detailSql = "SELECT  `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`= ? AND `product_sid` = ? "
    const detailQueryData = [orderSid, element.product_sid]
    const [detailData] = await DB.query(detailSql, detailQueryData)
    element.detail = detailData
  }


  const time = getData.order_time;
  const timeChanged = moment(time)
    .tz("Asia/Taipei")
    .format("HH:mm:ss");
  getData.order_time = timeChanged;
  getData.orderNumber = 'S' + getData.sid + getData.shop_sid + getData.member_sid


  const output = { getData, productDetails }
  res.json(output);
  return 
});
//已完成 概覽
router.use("/checkCompleted", async (req, res) => {

  let storeSid = req.token.sid;

  let sql =
    "SELECT o.`sid`, o.`member_sid`,o.`deliver_sid`, o.`shop_sid`, o.`store_order_sid`, o.`order_time`, o.`order_total`, o.`sale`, o.`deliver_fee`, o.`shop_order_status`,o.`total_amount`, m.`name` ,so.`shop_accept_time`,so.`shop_complete_time` ,d.name deliver_name FROM `orders` o LEFT JOIN `member` m ON m.`sid` = o.`member_sid` LEFT JOIN `shop_order` so ON o.`store_order_sid` = so.`sid` LEFT JOIN `deliver` d ON o.`deliver_sid` = d.sid WHERE o.`shop_order_status` =1 AND o.`shop_sid` = ? AND so.`cook_finish` = 1 AND so.`deliver_take` = 0 AND o.`order_complete` = 0 ORDER BY so.`shop_complete_time` DESC";

  let [getData] = await DB.query(sql, storeSid);

  getData.forEach((element) => {
    const time = element.shop_complete_time;
    const timeChanged = moment(time)
      .tz("Asia/Taipei")
      .format("HH:mm:ss");
    element.shop_complete_time = timeChanged;
    element.orderNumber = 'S' + element.sid + element.shop_sid + element.member_sid
  });
  res.json(getData);
  return 
});
//已完成 細節
router.use("/checkCompletedDetail", async (req, res) => {

  // console.log(req.body);
  // return res.json(1)
  const orderSid = req.body.orderSid
  let storeSid = req.token.sid;
  //訂單內容
  const checkOrderSql = "SELECT o.*, m.`name` memberName FROM `orders` o LEFT JOIN `member` m ON o.`member_sid` = m.`sid` WHERE o.`sid` = ? AND o.`shop_sid` = ?"
  const [[getData]] = await DB.query(checkOrderSql, [orderSid, storeSid]);
  //商品細節
  const productDetailSql = "SELECT od.* , p.`name` productName FROM `order_detail` od LEFT JOIN `products` p ON od.`product_sid` = p.`sid`    WHERE od.`order_sid` = ?"
  const [productDetails] = await DB.query(productDetailSql, orderSid);
  for (element of productDetails) {
    const detailSql = "SELECT  `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`= ? AND `product_sid` = ? "
    const detailQueryData = [orderSid, element.product_sid]
    const [detailData] = await DB.query(detailSql, detailQueryData)
    element.detail = detailData
  }


  const time = getData.order_time;
  const timeChanged = moment(time)
    .tz("Asia/Taipei")
    .format("HH:mm:ss");
  getData.order_time = timeChanged;
  getData.orderNumber = 'S' + getData.sid + getData.shop_sid + getData.member_sid


  const output = { getData, productDetails }
  res.json(output);
  return 
});

router.use("/readTime", async (req, res) => {
  const storeSid = req.token.sid
  const sql = "SELECT `wait_time` FROM `shop` WHERE `sid` = ?"
  const [[{ wait_time }]] = await DB.query(sql, storeSid)

  res.json(wait_time)
})


module.exports = router;
