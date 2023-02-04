const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
const moment = require("moment-timezone");

router.get("/", async (req, res) => {
  const lat = req.query.lat
  const lng = req.query.lng
  const maxDistance = req.query.maxDistance
  const sql = "SELECT  `name`,`sid`,`address`,`phone`,`average_evaluation`, `shop_lat`,`shop_lng`,(6378.137 *  2 * asin(SQRT(sin(((( ? - `shop_lat`) / 2) * PI()) / 180) * sin((( ( ? - `shop_lat`)  / 2) * PI()) / 180) + cos(( `shop_lat`  * PI()) / 180) * cos((? * PI()) / 180) * sin((((? - `shop_lng`) / 2) * PI()) / 180) * sin((( (  ?  -  `shop_lng`)  / 2) * PI()) / 180) ))) DE  FROM `shop` WHERE  6378.137 *  2 * asin(SQRT(sin(((( ? - `shop_lat`) / 2) * PI()) / 180) * sin((( ( ? - `shop_lat`)  / 2) * PI()) / 180) + cos(( `shop_lat`  * PI()) / 180) * cos((? * PI()) / 180) * sin((((? - `shop_lng`) / 2) * PI()) / 180) * sin((( (  ?  -  `shop_lng`)  / 2) * PI()) / 180) )) <? ORDER BY DE"
  const [result] = await DB.query(sql,[lat,lat,lng,lng,lng,lat,lat,lng,lng,lng,maxDistance])
  console.log(result);
  res.json(result)
})

module.exports = router;