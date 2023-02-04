const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});

router.use('/:sid', async (req, res) => {
    // console.log(req.session.member);
    //沒登入判定
    if (!req.params.sid) {
        return res.json(0);
    }
    //有登入才叫資料 
    else {

        let memberSid = req.params.sid;

        let sendData = {};

        const sql = "SELECT cc.`sid`, cc.`coupon_name`, cc.`shop_sid`, cc.`sale_detail`, cc.`use_range`, cc.`need_point`, cc.`get_limit_time`, cc.`expire`, cc.`coupon_available`, cc.`coupon_complete`, s.name FROM `coupon_content` cc LEFT JOIN `shop` s ON cc.`shop_sid` = s.`sid` WHERE (cc.`get_limit_time` >= NOW()) AND (cc.`coupon_available` = 1) ";

        let [getData] = await DB.query(sql);

        for (let element of  getData) {
            //時間格式設定
            const expire = element.expire
            if (expire) {
                element.expire  = moment(expire).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");                
            }
            const getTime = element.get_limit_time
            if (getTime) {
                element.get_limit_time = moment(getTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
            }
        }

        sendData.coupons = getData;

        const checkSql = "SELECT `coupon_sid` FROM `coupon` WHERE `member_sid` = ?";

        let [checkData] = await DB.query(checkSql, memberSid);

        sendData.check = checkData;

        const pointsql = "SELECT `point` FROM `member` WHERE `sid` = ?";

        let [[pointData]] = await DB.query(pointsql, memberSid);

        sendData.point = pointData.point;

        return res.json(sendData);
    }
})
module.exports = router;