const express = require("express");
const router = express.Router();
const DB = require("../../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

router.use("/Choosed", async (req, res) => {
  // console.log(req.session.member);
  //沒登入判定
  if (!req.token || !req.body) {
    return res.json(0);
  }
  //有登入才叫資料
  else if (req.token.sid === 101) {
    const sid = Number(req.body.getSid);
    const side = Number(req.body.getSide);
    console.log(sid);
    const sql =
      "SELECT msg.`sid`, msg.`post_sid`, msg.`post_side`, msg.`receive_sid`, msg.`receive_side`, msg.`post_content`, msg.`post_time`, msg.`order_sid` , m.`name` FROM `messages` msg LEFT JOIN `member` m ON  m.`sid` =  msg.`post_sid` WHERE  ((msg.`receive_sid` = 101 AND msg.`post_sid` = ? AND msg.`receive_side` = 4 AND msg.`post_side` = ?) OR (msg.`post_sid` = 101 AND msg.`post_side` = 4 AND msg.`receive_sid` = ? AND msg.`receive_side` =? ))";
    //     post_sid  post_side  receive_sid  receive_side
    let [getData] = await DB.query(sql, [sid, side,sid,side]);
    // console.log(getData);
    for (let element of getData) {
      const postTime = moment(element.post_time)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD HH:mm:ss");
      element.post_time = postTime;
      element.post_content = element.post_content.slice(1,element.post_content.length - 1)
    }
    res.json(getData);
    return 
  }
});

router.use("/", async (req, res) => {
  const names= ['','memberName','storeName','deliverName']
  // console.log(req.session.member);
  //沒登入判定
  if (!req.token) {
    return res.json(0);
  }

  //有登入才叫資料
  else if (req.token.sid === 101) {
    const sql =
    "SELECT msg.* ,m.name memberName ,s.name storeName FROM(SELECT `post_sid`, `post_side`, MAX(`post_time`)`post_time` FROM`messages`   WHERE`receive_side` = 4  AND`receive_sid` = 101  GROUP BY`post_sid`, `post_side`) msg LEFT JOIN `member` m ON m.`sid` = msg.`post_sid`   AND msg.`post_side` = 1 LEFT JOIN `shop` s ON s.`sid` = msg.`post_sid`  AND msg.`post_side` = 2 ORDER BY msg.post_time DESC";

    let [getData] = await DB.query(sql);
    //這樣叫出來已經照最新排序
    // console.log(getData);
    const dataArray = [{}, {}, {}, {}];
    const datas = {};
    for (let element of getData) {
      const sid = element.post_sid;
      const getSide = element.post_side
      //時間格式轉換
      const postTime = moment(element.post_time)
        .tz("Asia/Taipei")
        .format("YYYY-MM-DD HH:mm:ss");
      element.post_time = postTime;
      element.name = element[names[getSide]]      
      delete element['memberName']
      delete element['storeName']
      delete element['deliverName']
      dataArray[getSide][sid] = element
      // peoples.add(element.post_sid);
    }
    res.json(dataArray);
    return 
  }
});


module.exports = router;
// const sql =
// "SELECT msg.`sid`, msg.`post_sid`, msg.`post_side`, msg.`receive_sid`, msg.`receive_side`, msg.`post_content`, msg.`post_time`, msg.`order_sid` , m.`name` FROM `messages` msg LEFT JOIN `member` m ON  m.`sid` =  msg.`post_sid`  WHERE msg.`receive_side` = 3 AND msg.`receive_sid` = 101 ORDER BY msg.`post_time` DESC";



// SELECT msg.* ,m.name
// FROM (SELECT
// `post_sid`,
// `post_side`,
// MAX(`post_time`) `post_time`
// FROM `messages`
// WHERE `receive_side` = 4
// AND `receive_sid` = 101
// GROUP BY `post_sid`) msg
// LEFT JOIN `member` m
// ON m.`sid` =  msg.`post_sid` 