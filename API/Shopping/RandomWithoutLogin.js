const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

router.post("/", async (req, res) => {
  console.log(123456);
  const output = {};
  //篩選完成 傳進來的是不要的
  const rejectTypes = req.body;
  let sqlSpilit = "";
  //[1,2,3,4,5]
  //串接字串
  //(foreach)    value  
  for (let element of rejectTypes) {
    const num = Number(element);
    // console.log(num);
    if (num) {
      sqlSpilit += ` food_type_sid != ${num}  AND  `;
    }
  }

  const sqlBefore =
    "SELECT `sid`, `name`, `address`, `food_type_sid` FROM `shop` WHERE    ";
  //LIMIT 1
  const sqlAfter = " `sid` !=101  ORDER BY RAND() LIMIT 30  ";
  const fullSql = sqlBefore + sqlSpilit + sqlAfter;

  const [result] = await DB.query(fullSql);
  console.log(result);
  output.shopList = result;
  res.json(output);

})

module.exports = router;