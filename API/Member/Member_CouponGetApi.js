const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});

router.use('/:sid', async (req, res) => {
    // console.log(req.session.member);
    //登入判定
    if (!req.params.sid) {
        return res.json(0);
    }
    //有登入才叫資料 
    else {

        const memberSid = req.params.sid;

        const postData = req.body;
        console.log(req)
        const csid = postData.coupon_sid;

        const expireTime = postData.expire;

        const usepoint = postData.use_point;
        // let sendData = {};

        //優惠券資料增加
        const getsql = "INSERT INTO `coupon`(`coupon_sid`,`member_sid`,`expire`,`get_time`) VALUES( ?,?,?,NOW())";

        const [getResponse] = await DB.query(getsql, [csid, memberSid, expireTime]);

        // console.log({ getResponse });

        if (usepoint != 0) {
            //會員資料點數更新
            const pointSql = "UPDATE`member` SET `point` = `point` - ? WHERE `sid`   =  ?";

            const [pointResponse] = await DB.query(pointSql, [usepoint, memberSid]);

            // console.log({ pointResponse });

            //點數明細增加
            const pointDetailsql = "INSERT INTO `point_detail`(`member_sid`,`point_amount`,`point_change_time`,`point_change_method`,`coupon_sid`) VALUES(?,?,NOW(),0,?)";

            const [pointData] = await DB.query(pointDetailsql,[memberSid,-usepoint,csid]);

            // console.log({pointData});
        }

        return res.json(1);
    }
})
module.exports = router;