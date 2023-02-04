const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

function changeTime(oldTime, form) {
  return moment(oldTime).tz("Asia/Taipei").format(form);
}

//確認今天拿到幾次
router.get("/GetDailyTimes", async (req, res) => {
  const memberSid = req.token.sid;
  const YY = new Date().getFullYear();
  const MM = new Date().getMonth() + 1;
  const DD = new Date().getDate();
  const dateString = YY + "-" + MM + "-" + DD;
  const todayTimesSql =
    "SELECT MAX(`count`) todayCounts  FROM `daily_coupon` WHERE `member_sid` = ? AND `get_date` = ?";
  let [[{ todayCounts }]] = await DB.query(todayTimesSql, [
    memberSid,
    dateString,
  ]);
  res.json(todayCounts);
});

//確認今天還沒用的 作在元件裡面
router.get("/CheckTodayNotUse", async (req, res) => {
  const memberSid = req.token.sid;
  const YY = new Date().getFullYear();
  const MM = new Date().getMonth() + 1;
  const DD = new Date().getDate();
  const dateString = YY + "-" + MM + "-" + DD;
  // const checkNotUseSql =
  //   "SELECT  MIN(dc.`count`) count ,dc.sid,dc.`shop_sid`,s.`name`,dc.`member_sid`, dc.`expire`, dc.`cut_amount`, dc.`is_used` FROM `daily_coupon` dc  LEFT JOIN `shop` s  ON dc.`shop_sid`=s.`sid` WHERE `member_sid` = ? AND `is_used` =0 AND `expire` > NOW()";
    const checkNotUseSql =
    "SELECT  dc.sid,dc.`shop_sid`,s.`name`,dc.`member_sid`, dc.`expire`, dc.`cut_amount`, dc.`is_used` FROM `daily_coupon` dc  LEFT JOIN `shop` s  ON dc.`shop_sid`=s.`sid` WHERE `member_sid` = ? AND `is_used` =0 AND `expire` > NOW()";
  let [result] = await DB.query(checkNotUseSql, [memberSid, dateString]);
  // result.expire = changeTime(result.expire, 'YYYY/MM/DD HH:mm:ss')
  console.log(result);
  res.json(result);
});

//獲得隨機店家
router.post("/GetRandomStoreWithType", async (req, res) => {
  const output = {};
  //篩選完成 傳進來的是不要的
  const rejectTypes = req.body;
  const memberSid = req.token.sid;
  let sqlSpilit = "";
  //[1,2,3,4,5]
  //串接字串
  //(foreach)    value  
  for (let element of rejectTypes) {
    const num = Number(element);
    // console.log(num);
    if (num) {
      sqlSpilit += ` food_type_sid != ${num}  AND  `;
      // sqlSpilit.push(` food_type_sid != ${num}  AND  `)
    }
  }
  // sqlSpilit = sqlSpilit.join(' AND ')

  // sqlSpilit = '(' + sqlSpilit +')'
  //[1,5]
  const sqlBefore =
    "SELECT `sid`, `name`, `address`, `food_type_sid` FROM `shop` WHERE    ";
  //LIMIT 1
  const sqlAfter = " `sid` !=101  ORDER BY RAND() LIMIT 30  ";
  const fullSql = sqlBefore + sqlSpilit + sqlAfter;
  // console.log('完整SQL:'+fullSql);
  const [result] = await DB.query(fullSql);

  const YY = new Date().getFullYear();
  const MM = new Date().getMonth() + 1;
  const DD = new Date().getDate();
  const dateString = YY + "-" + MM + "-" + DD;
  // const checkSql = 'SELECT * FROM `daily_coupon` WHERE `member_sid` = ? AND `get_date` = ?'
  /*{
    "sid": 744,
    "name": "好吃壽司",
    "email": "S0965600842",
    "password": "S0965600842PS",
    "address": "台北市環河南路29號",
    "phone": "0965600842",
    "food_type_sid": 2,
    "bus_start": "830",
    "bus_end": "1730",
    "rest_right": 1,
    "src": "storeCover96",
    "wait_time": 30,
    "average_evaluation": 2.3
} */

  //展示用 獲得固定店家資料
  //===============================================分隔線================================================
  //        要的店家SID
  const presentationSid = 89;
  const forShowSql =
    "SELECT `sid`, `name`, `address`, `food_type_sid` FROM `shop` WHERE `sid` = ?";
  const [[showShopData]] = await DB.query(forShowSql, presentationSid);
  // console.log(showShopData);
  // result.unshift(showShopData)
  //===============================================分隔線================================================
  // const gettedShopSid = result[0].sid

  // output.shopList = result
  // console.log(gettedShopSid);
  // return res.json(output)
  //這個會拿到次數 或是NULL
  const todayTimesSql =
    "SELECT MAX(`count`) todayCounts  FROM `daily_coupon` WHERE `member_sid` = ? AND `get_date` = ?";
  let [[{ todayCounts }]] = await DB.query(todayTimesSql, [
    memberSid,
    dateString,
  ]);
  console.log(todayCounts); //直接就是數字 今天的次數
  todayCounts = todayCounts || 0
  //折價金額 第一次30..
  const cutamounts = [60, 40, 20];
  //3次就超過了
  if (todayCounts === 3) {
    output.over = true;
    console.log("over3");
  } else {
    //第三次加入  換成指定的店家
    if (todayCounts === 2) {
      result.shift()
      result.unshift(showShopData);
    }
    output.cutamount = cutamounts[todayCounts]
    const gettedShopSid = result[0].sid;
    const countIntoSql = todayCounts ? todayCounts : 0;
    //如果三次以下就寫入
    const insertDailySql =
      "INSERT INTO `daily_coupon`(`member_sid`, `shop_sid`, `expire`, `cut_amount`, `get_date`, `count`) VALUES (?,?,DATE_ADD(NOW(),INTERVAL 2 HOUR),?,NOW(),?) ";
    //old
    const injectDatas = [
      memberSid,
      gettedShopSid,
      cutamounts[countIntoSql],
      todayCounts + 1,
    ];
    const [dailyCouponResult] = await DB.query(insertDailySql, injectDatas);
    console.log(dailyCouponResult);
    console.log("notover");
  }

  output.todayCounts= (todayCounts ||0 ) +1
  output.shopList = result;
  res.json(output);
});


router.get('/CheckDailyCouponWithShopSid',async(req,res)=>{
  const memberSid = req.token.sid
  const shopSid = req.query.shopSid
  const sql ="SELECT `sid`, `member_sid`, `shop_sid`, `expire`, `cut_amount`, `is_used`, `get_date`, `count`, `use_time` FROM `daily_coupon` WHERE `member_sid` = ? AND `shop_sid` = ? AND `is_used`=0 AND  `expire` > NOW()"
  const shopNameSql = "SELECT name FROM `shop` WHERE `sid` = ?"
  const [[shopResult]] = await DB.query(shopNameSql,shopSid)
  console.log(shopResult);

  const [[result]] = await DB.query(sql,[memberSid,shopSid])
  if(shopResult.name.length&&result ){
    result.shopName = shopResult.name
  }
  res.json(result)
})

/*1	美式
2	日式
3	中式
4	義式
5	飲料
6	甜點*/

module.exports = router;
