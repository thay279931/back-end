const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}
//獲得下拉式選單選項
router.get("/GetSelectDetails", async (req, res) => {
  const memberSid = req.token.sid;
  const sql =
    "SELECT o. `sid`,o.`order_time`, o.`shop_sid` , s.`name`  FROM `orders` o LEFT JOIN `shop` s  ON s.`sid` = o. `shop_sid`  WHERE `order_complete` = 0 AND `member_sid` = ? ORDER BY `order_time` DESC ";
  const [result] = await DB.query(sql, memberSid);

  for (let element of result) {
    const orderId =
      "M" + changeTime(element.order_time, "YYMMDD") + element.sid;
    element.order_time = changeTime(element.order_time, "YYYY/MM/DD HH:mm:ss");
    element.orderId = orderId;
  }
  // console.log(result);
  res.json(result);
});

//獲得現在訂單的內容
router.get("/OrderDetails", async (req, res) => {
  const output = {};
  const orderSid = req.query.orderSid;
  console.log({orderSid});
  const memberSid = req.token.sid;
  // console.log(req.query);
  const sql =
    "SELECT o.* , s.`name` ,d.`name` deliverName FROM `orders` o LEFT JOIN `shop` s ON s.`sid` = o.`shop_sid` LEFT JOIN `deliver` d ON d.`sid` = o.`deliver_sid`  WHERE o.`member_sid` = ? AND o.`sid` = ?";

  const [[orderResult]] = await DB.query(sql, [memberSid, orderSid]);
  const orderId =
    "M" + changeTime(orderResult.order_time, "YYMMDD") + orderResult.sid;
  orderResult.orderId = orderId;
  orderResult.order_time = changeTime(
    orderResult.order_time,
    "YYYY/MM/DD HH:mm:ss"
  );

  output.orderResult = orderResult;

  const productSql = "SELECT od.* ,p.name FROM `order_detail` od LEFT JOIN `products` p ON od.`product_sid` = p.`sid` WHERE od.`order_sid` = ?"
  const [productResult] = await DB.query(productSql,orderSid)
  //===============================================分隔線================================================
  //選項細節  放進商品清單裡面
    for(let element of productResult){
      const productSid = element.product_sid
      const optionSql = "SELECT `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`=? AND `product_sid` = ? "
      const [result] = await DB.query(optionSql,[orderSid,productSid])
      element.options = result
    }
    console.log(productResult);
    output.productResult = productResult
    /*{
      sid: 539,
      order_sid: 222,
      product_sid: 1107,
      product_price: 120,
      amount: 1,
      name: '奶油蔬菜雞肉麵'
    }, */
  //店家接單狀態
  const storeAcept = !!orderResult.shop_order_status;
  //外送員接單狀態 用不到?
  const deliverTake = !!orderResult.deliver_order_status;




  //===============================================分隔線================================================
  //stepNow  1 店家還沒接單  2 店家還沒完成 3店家完成外送員還沒取餐  4外送員已取餐還沒到
  //店家如果還沒接單 到這裡結束(等待店家接單狀態)
  if (!storeAcept) {
    //階段1 店家還沒接單
    console.log('進到沒接單');
    output.stepNow = 1;
    res.json(output);
    return 
  }
  //===============================================分隔線================================================
  //店家已接單
  const shopOrderSid = orderResult.store_order_sid;
  const shopOrderSql = "SELECT * FROM `shop_order` WHERE `sid` = ?";
  const [[shopResult]] = await DB.query(shopOrderSql, shopOrderSid);

  shopResult.shop_accept_time = changeTime(
    shopResult.shop_accept_time,
    "YYYY/MM/DD HH:mm:ss"
  );
  output.shopResult = shopResult;
  //===============================================分隔線================================================
  //店家還沒完成 到這裡結束
  if (!shopResult.cook_finish) {
    //階段2 店家還沒完成
    output.stepNow = 2;
    res.json(output);
    return 
  }
  //===============================================分隔線================================================
  //店家完成 外送還沒取餐
  if (shopResult.cook_finish && !shopResult.deliver_take) {
    output.shopResult.shop_complete_time = changeTime(
      output.shopResult.shop_complete_time,
      "YYYY/MM/DD HH:mm:ss"
    );
    //階段3 店家完成 外送員還沒取餐
    output.stepNow = 3;
    res.json(output);
    return 
  }
  //===============================================分隔線================================================
  //外送員已取餐
  //階段4 外送員已取餐 還沒到
  const deliverOrderSid = shopResult.deliver_order_sid;
  const deliverSql =
    "SELECT `sid`, `member_sid`, `shop_sid`, `deliver_sid`, `store_order_sid`, `order_sid`, `deliver_memo`, `deliver_take_time`, `complete_time`, `order_finish`, `deliver_fee` FROM `deliver_order` WHERE `member_sid` = ? AND `order_sid` = ? AND `store_order_sid` = ?";
  const [[deliverResult]] = await DB.query(deliverSql, [
    memberSid,
    orderSid,
    shopOrderSid,
  ]);
  deliverResult.deliver_take_time = changeTime(
    deliverResult.deliver_take_time,
    "YYYY/MM/DD HH:mm:ss"
  );
  output.deliverResult = deliverResult;
  output.stepNow = 4;
  res.json(output);
  return 
});
//===============================================分隔線================================================
//orderResult
/*{
  sid: 107,
  member_sid: 1,
  shop_sid: 89,
  deliver_sid: null,
  store_order_sid: null,
  deliver_order_sid: null,
  shop_memo: '',
  deliver_memo: '',
  order_time: 2022-11-20T08:02:16.000Z,
  order_total: 445,
  coupon_sid: 0,
  sale: 445,
  paid: 0,
  pay_method: 0,
  LinePayID: null,
  daily_coupon_sid: 0,
  deliver_fee: 10,
  cook_time: 40,
  shop_order_status: 0,
  deliver_order_status: 0,
  total_amount: 3,
  receive_name: 'ゆう',
  receive_phone: '0952400243',
  receive_address: '106台北市大安區復興南路一段390號2樓',
  order_complete: 0
}*/
//===============================================分隔線================================================
//shopResult
/* {
    "sid": 1,
    "member_sid": 1,
    "deliver_sid": null,
    "deliver_order_sid": null,
    "order_sid": 1,
    "shop_memo": null,
    "shop_accept_time": "2022-11-16T00:55:32.000Z",
    "shop_complete_time": "2022-11-16T05:03:23.000Z",
    "deliver_take": 0,
    "shop_sid": 89,
    "cook_finish": 1
} */

router.use("/", async (req, res) => {
  res.json(1);
});

module.exports = router;
