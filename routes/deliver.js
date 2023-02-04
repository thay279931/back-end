const express = require('express');
const router = express.Router();
const db = require('../Modules/db_connect');
/* ----------外送員接單------------ */
async function getListData(req, res){
    const sql1 = "SELECT member.name AS client, orders.receive_address, orders.cook_time, shop_order.sid, shop_order.member_sid, shop_order.order_sid, shop_order.shop_sid, shop.name, shop.address, orders.deliver_memo, orders.deliver_fee FROM ((shop_order INNER JOIN shop ON shop.sid = shop_order.shop_sid)INNER JOIN orders ON shop_order.order_sid = orders.sid)INNER JOIN member ON shop_order.member_sid = member.sid WHERE shop_order.deliver_sid IS NULL";
    [rows1] = await db.query(sql1);

    return {rows1};
}
router.get('/deliverlist', async (req, res)=>{ 
    res.json(await getListData(req, res));
});
/* ----------------------------- */
/* ----------外送員訂單確認------------ */
//外送員接單(動作)
router.post('/sendOrder', async (req, res)=>{
    const sqlenter = "INSERT INTO `deliver_order`(`member_sid`, `shop_sid`, `deliver_sid`, `store_order_sid`, `order_sid`, `deliver_memo`, `order_finish`, `deliver_fee`,  `deliver_check_time`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    await db.query(sqlenter, 
        [
            req.body.member_sid, 
            req.body.shop_sid, 
            req.body.deliver_sid, 
            req.body.sid, 
            req.body.order_sid, 
            req.body.deliver_memo, 
            req.body.order_finish, 
            req.body.deliver_fee
        ]);
    const sqlshop = "UPDATE shop_order SET deliver_sid=? WHERE order_sid=?"
    await db.query(sqlshop, [req.body.deliver_sid, req.body.order_sid]);
    const sql2 = "UPDATE shop_order SET shop_order.deliver_order_sid = (SELECT deliver_order.sid FROM deliver_order WHERE shop_order.order_sid = deliver_order.order_sid)";
    await db.query(sql2);
    //訂單更新資訊
    const orderSql = "UPDATE `orders` SET `deliver_sid`=? , `deliver_order_status`=1 WHERE `sid` = ? "
    const [orderUpdateResult] = await db.query(orderSql,[req.body.deliver_sid,req.body.order_sid])    
    //-----------
    const sql3 = "SELECT * FROM shop_order WHERE order_sid = ?"  
    const [add] = await db.query(sql3, [req.body.order_sid]);
    res.json(add);
    // const sql4 = "UPDATE orders SET deliver_sid = ?, deliver_order_sid = ?, deliver_order_status=1 WHERE sid = ?";   //還少deliver_order_sid 
    const sql4 = "UPDATE orders SET deliver_sid = ?, deliver_order_status=1 WHERE sid = ?";
    await db.query(sql4, 
        [
            req.body.deliver_sid, 
                                        //還少deliver_order_sid 
            req.body.deliver_sid, 
        ]);
    const sql5 = "UPDATE orders SET orders.deliver_order_sid = (SELECT deliver_order.sid FROM deliver_order WHERE orders.store_order_sid = deliver_order.store_order_sid)";
    const [odsid] = await db.query(sql5);
})
/* ----------接單後訂單預覽------------- */
router.get('/deliverorder/:id', async(req, res)=>{
    const sql1 ="SELECT orders.receive_address, member.name,  shop.name AS shopname, shop.address, shop.phone, member.name, deliver_order.deliver_memo,  deliver_order.deliver_fee, deliver_order.order_sid FROM ((deliver_order INNER JOIN shop ON deliver_order.shop_sid = shop.sid) INNER JOIN member ON deliver_order.member_sid = member.sid) INNER JOIN orders ON deliver_order.store_order_sid = orders.store_order_sid WHERE order_sid = ? AND deliver_order.order_finish = 0";
    const [rows] = await db.query(sql1, [req.params.id]);
    const sql2 ="SELECT order_detail.product_sid, products.name, order_detail.product_price, order_detail.amount FROM (order_detail INNER JOIN products ON order_detail.product_sid = products.sid ) WHERE order_detail.order_sid = ?";
    const [food] = await db.query(sql2, [req.params.id]);
    const sql3 = "SELECT SUM(orders.sale+orders.deliver_fee)AS total FROM orders WHERE orders.sid = ? ";
    const [total] = await db.query(sql3, [req.params.id]);
    for (element of food) {
        const detailSql = "SELECT  `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`= ? AND `product_sid` = ? ";
        const [detailData] = await db.query(detailSql, [req.params.id, element.product_sid]);
        element.detail = detailData
    }
    res.json({rows,food,total});
}) 
/* ---------------------------------- */
/* ----------接單後訂單取餐鈕----------- */
router.put('/deliverorder/:id', async(req, res)=>{
    const sql1 = "UPDATE deliver_order SET `deliver_take_time`=NOW() WHERE order_sid=?";
    await db.query(sql1, [req.params.id]);
    const sql2 = "UPDATE shop_order SET `deliver_take`=1 WHERE order_sid=?";
    await db.query(sql2, [req.params.id]);
    console.log('取餐');
})
/* ---------------------------------- */
/* -----------接單後訂單完成鈕---------- */
router.put('/finishdeliverorder/:id', async(req, res)=>{
    const sql1 = "UPDATE deliver_order SET `complete_time`=NOW(), `order_finish`=1 WHERE order_sid=?";
    await db.query(sql1, [req.params.id]);
    const sql2 = "UPDATE orders SET paid = 1, order_complete = 1 WHERE sid = ?";
    await db.query(sql2, [req.params.id]);
})
/* ---------------------------------- */
/* --------------過往紀錄------------- */
router.get('/dataslist/:id', async(req, res)=>{
    const sql = "SELECT deliver_order.order_sid, deliver_order.order_sid, shop.name AS shopname, shop.address, deliver_fee, member.name, deliver_order.deliver_check_time, deliver_order.deliver_take_time, deliver_order.complete_time FROM( deliver_order INNER JOIN member ON deliver_order.member_sid = member.sid) INNER JOIN shop ON deliver_order.shop_sid = shop.sid WHERE deliver_order.order_finish = 1 AND deliver_order.deliver_sid = 1 ORDER BY deliver_order.deliver_check_time DESC";
    // const sql = "SELECT deliver_order.order_sid, deliver_order.order_sid, shop.name AS shopname, shop.address, deliver_fee, member.name, deliver_order.deliver_check_time, deliver_order.deliver_take_time, deliver_order.complete_time FROM( deliver_order INNER JOIN member ON deliver_order.member_sid = member.sid) INNER JOIN shop ON deliver_order.shop_sid = shop.sid WHERE deliver_order.order_finish = 1 AND deliver_order.deliver_sid = ?";
    const [listrow] = await db.query(sql,[req.params.id]);
    res.json(listrow);
})
/* ---------------------------------- */
/* -----------過往紀錄菜單------------- */
router.get('/foodmeun/:id', async(req, res)=>{
    const sql ="SELECT order_detail.product_sid, products.name, products.price, order_detail.amount FROM (order_detail INNER JOIN products ON order_detail.product_sid = products.sid ) WHERE order_detail.order_sid = ?";
    const [food] = await db.query(sql, [req.params.id]);
    for (element of food) {
        const detailSql = "SELECT  `option_detail_sid`, `options`, `option_price` FROM `order_option` WHERE `order_sid`= ? AND `product_sid` = ? ";
        const [detailData] = await db.query(detailSql, [req.params.id, element.product_sid]);
        element.detail = detailData
    }
    res.json(food);
})
/* ---------------------------------- */

module.exports = router;