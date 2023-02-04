const express = require("express");
const router = express.Router();
const DB = require("../../Modules/ConnectDataBase");
// const moment = require("moment-timezone");
// const upload = require(__dirname + "/../Modules/upload-img");

/* 路徑
/use('localhost:3001/Shopping')
*/

//取得所有店家
router.use("/", async (req, res, next) => {
  //輸出的結果，暫時無用
  let output = {};

  //是否有搜尋文字
  ///use('localhost:3001/Shopping/?search=')
  let search = req.query.search ? req.query.search.trim().split(",") : "";
  //測試用
  // let search = ""

  //是否有價格上限
  let price_max = req.query.price_max ? Number(req.query.price_max.trim()) : 0;
  //是否有價格下限
  let price_min = req.query.price_min ? Number(req.query.price_min.trim()) : 0;
  //是否有配送時間
  let wait_time = req.query.wait_time ? Number(req.query.wait_time.trim()) : 0;
  //是否有排序方式
  let order = req.query.order;
  
  //預設搜尋來源為店家
  let origin = ` shop `;

  //SQL條件字串
  let where = ` WHERE shop.sid <> '101' `;

  //SQL資料排序方式(預設是按照評分)
  order = ` ORDER BY average_evaluation DESC `;

  console.log("價格上限", price_max);
  console.log("價格下限", price_min);
  console.log("等待時間", wait_time);

  let food_type = ` , food_type.sid AS food_type_sid , food_type.type_name `;
  let food_join = ` left join food_type on shop.food_type_sid = food_type.sid `;
  //SQL搜尋後
  //SELECT shop.*  , products.sid AS products_sid , products.name AS products_name , products.price FROM `shop` left Join products on shop.sid = products.shop_sid

  //SQL僅搜尋台北/臺北
  //SELECT shop.* , COUNT(*) AS products_count ,COUNT(*) OVER() AS total_rows , products.sid AS products_sid , products.name AS products_name , products.price , food_type.type_name  FROM shop left Join products on shop.sid = products.shop_sid AND price <= 250 AND price >= 150 left join food_type on shop.food_type_sid = food_type.sid WHERE shop.sid <> 101 AND shop.`address` LIKE '%台北%' OR shop.`address` LIKE '%臺北%' GROUP BY shop.sid ORDER BY average_evaluation DESC

  //SQL僅搜尋商品
  //SELECT shop.*  , products.sid AS products_sid , products.name AS products_name , products.price FROM `products` inner Join shop on shop.sid = products.shop_sid AND products.price < 100

  //SQL完整搜尋語句(共搜尋三字段)
  // SELECT shop.*  ,
  //products.sid AS products_sid , products.name AS products_name , products.price  FROM shop left Join products on shop.sid = products.shop_sid AND price <= 250 AND price >= 150 WHERE 1 AND shop.`name` LIKE '%咖哩%' OR products.`name` LIKE '%咖哩%' OR shop.`name` LIKE '%豆漿%' OR products.`name` LIKE '%豆漿%' OR shop.`name` LIKE '%沙茶%' OR products.`name` LIKE '%沙茶% GROUP BY shop.sid ORDER BY average_evaluation DESC;

  //SQL加上查詢總筆數
  // SELECT shop.* , COUNT(*) AS products_count ,COUNT(*) OVER() AS total_rows , products.sid AS products_sid , products.name AS products_name , products.price  FROM shop left Join products on shop.sid = products.shop_sid AND price <= 250 AND price >= 150 WHERE shop.sid <> 101 AND shop.`name` LIKE '%咖哩%' OR products.`name` LIKE '%咖哩%' OR shop.`name` LIKE '%豆漿%' OR products.`name` LIKE '%豆漿%' OR shop.`name` LIKE '%沙茶%' OR products.`name` LIKE '%沙茶%' GROUP BY shop.sid ORDER BY average_evaluation DESC;

  //SQL再加上食物種類
  //SELECT shop.* , COUNT(*) AS products_count ,COUNT(*) OVER() AS total_rows , products.sid AS products_sid , products.name AS products_name , products.price , food_type.type_name  FROM shop left Join products on shop.sid = products.shop_sid AND price <= 250 AND price >= 150 left join food_type on shop.food_type_sid = food_type.sid WHERE shop.sid <> 101 AND shop.`name` LIKE '%咖哩%' OR products.`name` LIKE '%咖哩%' OR shop.`name` LIKE '%豆漿%' OR products.`name` LIKE '%豆漿%' OR shop.`name` LIKE '%沙茶%' OR products.`name` LIKE '%沙茶%' GROUP BY shop.sid ORDER BY average_evaluation DESC

  //如果搜尋文字or價格上限or價格下限
  if (search || price_max || price_min || wait_time) {
    //SQL搜尋放入商品表的SID、商品名、商品價格
    let products = ``;

    //SQL搜尋加入商品表
    let join = ``;

    //若有設定等待時間，則where的頭必須加入
    if (!search || wait_time) {
      where += ` AND wait_time <= ${wait_time}`;
    }

    ////如果有文字搜尋，則加在where語句後，同時搜尋店家和商品
    if (search) {
      //加入餐點的sid、name、price這三行
      products = ` , products.sid AS products_sid , products.name AS products_name , products.price `;
      //left join 餐點所屬店家sid=店家的sid、name、price
      join = ` inner Join products on shop.sid = products.shop_sid `;
      //搜尋字段中的第一個
      where += ` AND shop.\`name\` LIKE ${DB.escape("%" + search[0] + "%")}
            OR products.\`name\` LIKE ${DB.escape("%" + search[0] + "%")}
            `;
      if (wait_time > 0) {
        where += ` AND wait_time <= ${wait_time} `;
      }
      //多重字段下，第二個以後的字段
      if (search.length > 1) {
        for (let x = 1; x < search.length; x++) {
          console.log(search[x]);
          where += ` OR shop.\`name\` LIKE ${DB.escape("%" + search[x] + "%")}
        OR products.\`name\` LIKE ${DB.escape("%" + search[x] + "%")}
        `;
          if (wait_time > 0) {
            where += ` AND wait_time <= ${wait_time} `;
          }
        }
      }
      //若有文字搜索中有設定等待時間，則where尾部必須再加一次
      if (wait_time > 0) {
        where += ` AND wait_time <= ${wait_time}`;
      }
    }
    //若沒有搜尋文字但有價格條件，將搜尋來源變更為僅商品
    if (!search && price_max) {
      //加入餐點的sid、name、price這三行
      products = ` , products.sid AS products_sid , products.name AS products_name , products.price `;
      //inner join 餐點所屬店家sid=店家的sid、name、price
      join = ` inner Join shop on shop.sid = products.shop_sid `;
      //來源變更為"商品"
      origin = ` products `;
    }
    if (!search && price_min) {
      products = ` , products.sid AS products_sid , products.name AS products_name , products.price `;
      origin = ` products `;
      join = ` inner Join shop on shop.sid = products.shop_sid `;
    }

    //TODO:有如果價格上限是0而非空值則一樣被視為空值的BUG
    //價格範圍上限
    if (price_max > 0) {
      join += ` AND price <= ${price_max} `;
    }

    //價格範圍下限
    if (price_min > 0) {
      //如果下限>上限，讓下限=上限
      if (price_min > price_max && price_max > 0) {
        price_min = price_max;
      }
      join += ` AND price >= ${price_min} `;
    }

    //組成完整的SQL結構語句
    let sql_search = `SELECT shop.* , COUNT(*) AS products_count , COUNT(*) OVER() AS total_rows  ${products} ${food_type} FROM ${origin} ${join} ${food_join} ${where} GROUP BY sid ${order}`;

    //要資料
    let [result] = await DB.query(sql_search);
    output.result = result;
    res.json(result);

    console.log("query字串", req.query.search);
    console.log("搜尋字串", search);
    console.log("SQL語法", sql_search);
  } else {
    //若無搜尋則顯示所有商家
    sql_search = ` SELECT shop.* ${food_type} from shop ${food_join} ${where} ${order}`;

    //要資料
    let [result] = await DB.query(sql_search);
    output.result = result;
    res.json(result);
  }

  // if (area){
  //   sql_search = ` SELECT shop.* , COUNT(*) AS products_count ,COUNT(*) OVER() AS total_rows , products.sid AS products_sid , products.name AS products_name , products.price , food_type.type_name  FROM shop left Join products on shop.sid = products.shop_sid AND price <= 250 AND price >= 150 left join food_type on shop.food_type_sid = food_type.sid WHERE shop.sid <> 101 AND shop.\`address\` LIKE '%台北%' OR shop.\`address\` LIKE '%臺北%' GROUP BY shop.sid ORDER BY average_evaluation DESC `
  //   let [result] = await DB.query(sql_search)
  //   output.result = result
  //   res.json(result);
  // }
});

module.exports = router;
