const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
/*{
  shopSid: '1',
  deliverFee: 10,
  receiveName: 'ゆう',
  receivePhone: '0952400243',
  sendAddress: '106台北市大安區復興南路一段390號2樓....',
  couponCutAmount: 0,
  couponSid: 0,
  details: {
    shopTotal: 20,
    shopName: '一號店',
    list: {
    },
    shopPriceTotal: 1290
  },
  storeMemo: '店家備註',
  deliverMemo:'外送員備註'
        dailyCouponSid: dailyCouponSid,
      dailyCouponAmount: dailyCouponAmount,
}*/
router.use("/", async (req, res) => {
  const output = {}
  const postData = req.body
  const productDatas = postData.details.list
  const memberSid = req.token.sid
  const shopSid = Number(postData.shopSid)
  const shopMemo = postData.storeMemo
  const deliverMemo = postData.deliverMemo
  //NOW()
  const order_total = Number(postData.details.shopPriceTotal)
  const coupon_sid = postData.couponSid || 0
  const saled = Number(order_total) - Number(postData.couponCutAmount) - Number(postData.dailyCouponAmount)
  const daily_coupon_sid = postData.dailyCouponSid || 0
  const deliverFee = postData.deliverFee
  const cook_time = 40
  const total_amount = postData.details.shopTotal
  const receiveName = postData.receiveName
  const receivePhone = postData.receivePhone
  const sendAddress = postData.sendAddress
  //===============================================分隔線================================================
  //訂單概覽
  const valueArray = [memberSid, shopSid, shopMemo, deliverMemo, order_total, coupon_sid, saled, 0, 0, daily_coupon_sid, deliverFee, cook_time, total_amount, receiveName, receivePhone, sendAddress]

  console.log(postData);
  const sql = "INSERT INTO `orders`(`member_sid`, `shop_sid`, `shop_memo`, `deliver_memo`, `order_time`, `order_total`, `coupon_sid`, `sale`, `paid`, `pay_method`, `daily_coupon_sid`, `deliver_fee`, `cook_time`, `total_amount`, `receive_name`, `receive_phone`, `receive_address`) VALUES (?,?,?,?,NOW(),?,?,?,?,?,?,?,?,?,?,?,?)"
  const [{ insertId }] = await DB.query(sql, valueArray)
  console.log(insertId);
  output.orderSid = insertId;
  //===============================================分隔線================================================
  //商品細節
  /* list :'11': {
    amount: 1,
    name: '十一號產品',
    price: 40,
    cuttedPrice: 40,
    imageUrl: '',
    details: {}
  }*/
  const orderSid = insertId
  const detailSids = []
  for (let sid in productDatas) {
    const data = productDatas[sid]
    const productSid = sid
    const amount = data.amount
    const price = data.cuttedPrice
    const productSql = "INSERT INTO `order_detail`( `order_sid`, `product_sid`, `product_price`, `amount`) VALUES (?,?,?,?)"
    const [result] = await DB.query(productSql, [orderSid, productSid, price, amount])
    console.log(result.insertId);
    detailSids.push(result.insertId)

    //===============================================分隔線================================================
    //options
    for (let element of productDatas[sid].details) {
      const detailSid = element.sid
      const detailName = element.name
      const detailPrice = element.price
      const optionSql = "INSERT INTO `order_option`(`order_sid`, `product_sid`, `option_detail_sid`, `options`, `option_price`) VALUES (?,?,?,?,?)"
      const optionDatas = [orderSid, productSid, detailSid, detailName, detailPrice]
      const [detailResult] = await DB.query(optionSql, optionDatas)
      console.log(detailResult);
    }
    //===============================================分隔線================================================

  }
  output.productDetails = detailSids




  /*"details": [
        {
            "name": "加料",
            "sid": 1,
            "list": [
                {
                    "sid": 2,
                    "name": "珍珠",
                    "price": 15
                },
                {
                    "sid": 3,
                    "name": "耶果",
                    "price": 10
                }
            ]
        },
        {
            "name": "溫度",
            "sid": 2,
            "list": [
                {
                    "sid": 4,
                    "name": "去冰",
                    "price": 15
                }
            ]
        } */




  //===============================================分隔線================================================
  //紅利增加
  //方式1 改成消費獲得紅利
  const newPoint = parseInt(order_total / 10);
  //會員資料表更新
  const memberPointSql = "UPDATE `member` SET `point` = `point` + ?  WHERE `sid` = ?"
  const [memberResult] = await DB.query(memberPointSql, [newPoint, memberSid])
  output.memberResult = memberResult
  //點數明細資料表更新
  const pointSql = "INSERT INTO `point_detail`(`member_sid`, `point_amount`, `point_change_time`, `point_change_method`) VALUES (?,?,NOW(),?)"
  const pointInsertArray = [memberSid, newPoint, 1]
  const [pointResult] = await DB.query(pointSql, pointInsertArray);
  console.log(pointResult);
  output.pointResult = pointResult
  //===============================================分隔線================================================
  //優惠券更新
  if (coupon_sid !== 0) {
    const couponSql = "UPDATE `coupon` SET `order_sid`= ? , `is_used`= 1,`used_time`= NOW() WHERE `member_sid` = ? AND sid = ?"
    const [couponResult] = await DB.query(couponSql, [orderSid, memberSid, coupon_sid])
    output.couponResult = couponResult
  }
  //每日優惠券更新
  if (daily_coupon_sid !== 0) {
    const dailyCouponSql = "UPDATE `daily_coupon` SET `is_used`=1,`use_time`=NOW() WHERE `sid`=?"
    const [result] = await DB.query(dailyCouponSql, daily_coupon_sid)
    console.log(result);
  }
  res.json(output)
})

module.exports = router;