const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
// const moment = require("moment-timezone");
// const upload = require(__dirname + "/../Modules/upload-img");

/* 路徑
/use('localhost:3001/City/Taipei')
*/

//取得所有店家
router.use("/Taipei", async (req, res, next) => {
  //輸出的結果，暫時無用
  let output = {};

  //SQL條件字串
  let where = ` WHERE shop.sid <> 101 AND shop.\`address\` LIKE '%台北%' OR shop.\`address\` LIKE '%臺北%'  `;

  //SQL資料排序方式(預設是按照評分)
  order = ` ORDER BY average_evaluation DESC `;

  let food_type = ` , food_type.sid AS food_type_sid , food_type.type_name `;
  let food_join = ` left join food_type on shop.food_type_sid = food_type.sid `;



  //顯示所有台北商家
  sql_search = ` SELECT shop.*  ${food_type} from shop ${food_join} ${where} ${order}`;

  console.log("SQL語法", sql_search);

  //要資料
  let [result] = await DB.query(sql_search);
  output.result = result;
  res.json(result);
});

module.exports = router;
