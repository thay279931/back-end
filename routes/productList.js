const express = require("express");
const router = express.Router();
const db = require("../Modules/db_connect");

router.get("/", async (req, res) => {
  const data = {
    shop: {},
    types: {},
    products: {},
    options_types: {},
    options: {},
  };
  const { shop_sid } = req.query;
  console.log(shop_sid)

  const shop_sql = "SELECT * FROM `shop` WHERE sid=?";
  const [[shop_rows]] = await db.query(shop_sql, [shop_sid]);

  const type_sql = "SELECT * FROM products_types WHERE shop_sid=? ORDER BY type_order";
  const [type_rows] = await db.query(type_sql, [shop_sid]);

  const product_sql = "SELECT * FROM `products` WHERE shop_sid=?";
  const [product_rows] = await db.query(product_sql, [shop_sid]);

  // 帶有product_sid的option_type
  const option_type_sql =
    "SELECT ot.*, otpr.product_sid FROM `options_types` ot LEFT JOIN `options_types_products_relation` otpr ON ot.sid=otpr.options_type_sid LEFT JOIN `products` p ON otpr.product_sid=p.sid WHERE p.shop_sid=?";
  const [option_type_rows] = await db.query(option_type_sql, [shop_sid]);

  const option_sql =
    "SELECT o.*, ot.shop_sid FROM `options` o LEFT JOIN `options_types` ot ON o.options_type_sid=ot.sid WHERE ot.shop_sid=?";
  const [option_rows] = await db.query(option_sql, [shop_sid]);

  data.shop = shop_rows;
  data.types = type_rows;
  data.products = product_rows;
  data.options_types = option_type_rows;
  data.options = option_rows; 

  res.json(data);
});

module.exports = router;
