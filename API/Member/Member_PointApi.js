const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");
const jwt = require('jsonwebtoken');
router.use((req, res, next) => {
  next();
});

let parsedToken = null;
router.use("/",(req,res,next)=>{
  const tokenGet = req.header('Authorization').replace('Bearer ', '')
  //因為進來的時候會加Bearer 所以NULL會變文字
  if(tokenGet==="null"){
    //沒傳東西直接擋掉
    return res.json(0);
  }
  else {
    //先轉換再放回全域變數
    parsedToken = jwt.verify(tokenGet, process.env.JWT_SECRET);
    next();
  }
})
//會員登入檢查
router.use("/Member",async (req,res,next)=>{
  const loginSql = "SELECT `sid`, `name`, `email` FROM `member` WHERE `email` = ? AND `name` = ? AND `sid` = ?";
  const {email,sid,name} = parsedToken
  const [[result]] = await DB.query(loginSql, [email,name,sid]);
  if(!result){
    return res.json(0);
  }
  else{
    next();
  }
})

router.use("/", async (req, res) => {

    const {sid} = parsedToken;

  let memberSid = sid;
  

  let sql =
    "SELECT p.*,cc.`coupon_name`,m.`point` FROM `point_detail` p LEFT JOIN `coupon_content` cc ON p.`coupon_sid` = cc.`sid` LEFT JOIN `member` m ON p.`member_sid` = m.`sid` WHERE  `member_sid`= ? ORDER BY p.`point_change_time` DESC ";


  let [getData] = await DB.query(sql, memberSid);

  //轉換時間格式
  getData.forEach((element) => {
    const time = element.point_change_time;
    const timeChanged = moment(time)
      .tz("Asia/Taipei")
      .format("YYYY-MM-DD HH:mm:ss");
    element.point_change_time = timeChanged;
  });
  // console.log(getData);
  // console.log("有登入");
  return res.json(getData);
});

//$msid = $_SESSION['user']['sid'];

// $sql = "SELECT p.*,cc.`coupon_name`
// FROM `point_detail` p
// LEFT JOIN `coupon_content` cc
// ON p.`coupon_sid` = cc.`sid`
// WHERE
// `member_sid`=$msid";
module.exports = router;
