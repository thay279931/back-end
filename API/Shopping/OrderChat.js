const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

router.use("/", async (req, res) => {
  const { targetSid, orderSid } = req.body;
  const mySid = req.token.sid;
  const mySide = req.token.sid;
  const targetSide = mySide === 1 ? 3 : 1;
  const sql =
    "SELECT msg.`sid`, msg.`post_sid`, msg.`post_side`, msg.`receive_sid`, msg.`receive_side`, msg.`post_content`, msg.`post_time`, msg.`order_sid`  FROM `messages` msg WHERE msg.`order_sid` =? AND ((msg.`post_side` =? AND msg.`post_sid`=? AND msg.`receive_side` =? AND msg.`receive_sid`=? ) OR (msg.`receive_side` =? AND msg.`receive_sid`=? AND msg.`post_side` =? AND msg.`post_sid`=?)) ORDER BY msg.`post_time` DESC ";
  const queryDatas = [orderSid, mySide, mySid,targetSide,targetSid,mySide, mySid,targetSide,targetSid];
  let [getData] = await DB.query(sql, queryDatas);
  // console.log(getData);
  // return res.json(1)
  for (let element of getData) {
    const postTime = moment(element.post_time)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD HH:mm:ss");
    element.post_time = postTime;
    element.post_content = element.post_content.slice(
      1,
      element.post_content.length - 1
    );
  }
  res.json(getData);
});

module.exports = router;
